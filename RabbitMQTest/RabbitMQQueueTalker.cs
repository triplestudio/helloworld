using System;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Diagnostics;
using System.Collections.Generic;

namespace RabbitMQTest
{
    /// <summary>
    /// 简易的 RabbitMQ 队列通话者
    /// 
    /// 1. 发送消息至指定队列
    /// 2. 从指定队列中接收消息
    /// </summary>
    public class RabbitMQQueueTalker
    { 
        // 连接
        private IConnection _Connection;
        // 发送通道
        private IModel _SendChannel;
        // 接收通道
        private IModel _ReceiveChannel;

        #region 连接相关信息
        private string _Host; public string Host { get { return _Host; } }
        private string _UserName; public string UserName { get { return _UserName; } }
        private string Password { get; set; }
        // 默认的发送队列名称
        private string _SendQueueName; public string SendQueueName { get { return _SendQueueName; } }
        // 接收消息队列名称
        private string _ReceiveQueueName; public string ReceiveQueueName { get { return _ReceiveQueueName; } }
        // 持久化（服务重启消息还在）：当首次建立队列时，该值决定了队列的特性，之后的调用需要一致
        private bool _Durable; public bool Durable { get { return _Durable; } }

        #endregion

        public RabbitMQQueueTalker(string host, string username, string password, string sendQueueName, string receiveQueueName, bool durable)
        {
            _Host = host;
            _UserName = username;
            Password = password;
            _SendQueueName = sendQueueName;
            _ReceiveQueueName = receiveQueueName;
            _Durable = durable;
        }

        #region RabbitMQ 连接与通道操作
        // 获取连接（断线重连）
        private IConnection GetConnection()
        {
            if (_Connection != null) return _Connection;

            var factory = new ConnectionFactory()
            {
                HostName = this.Host,
                UserName = this.UserName,
                Password = this.Password,
                RequestedHeartbeat = 10,
                AutomaticRecoveryEnabled = true
            };

            try
            {
                factory.RequestedConnectionTimeout = 6000;
                _Connection = factory.CreateConnection();

                // 阻塞解除之后检测接收通道是否还打开
                _Connection.ConnectionUnblocked += (o, e) => {
                    BuildReceiveChannel();
                };
                
                BuildReceiveChannel();
                
                return _Connection;
            }
            catch (Exception se)
            {
                Debug.WriteLine(se.Message);
                Debug.WriteLine(se.StackTrace);
                return null;
            }
        }

        // 获取发送通道
        private IModel GetSendChannel()
        {
            if (_SendChannel != null && !_SendChannel.IsClosed) return _SendChannel;

            var conn = GetConnection();
            if (conn == null) return null;

            try
            {
                _SendChannel = conn.CreateModel();

                _SendChannel.QueueDeclare(queue: SendQueueName,
                                 durable: Durable,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

                return _SendChannel;
            }
            catch (Exception se)
            {
                Debug.WriteLine(se.Message);
                Debug.WriteLine(se.StackTrace);
                return null;
            }
        }

        // 建立接收通道
        private IModel BuildReceiveChannel()
        {
            if (_ReceiveChannel != null && !_ReceiveChannel.IsClosed) return _ReceiveChannel;

            var conn = GetConnection();
            if (conn == null) return null;

            try
            {
                _ReceiveChannel = conn.CreateModel();

                _ReceiveChannel.QueueDeclare(queue: ReceiveQueueName,
                                durable: Durable,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

                var consumer = new EventingBasicConsumer(_ReceiveChannel);

                // 绑定消息事件
                consumer.Received += (model, ea) =>
                {
                    var message = Encoding.UTF8.GetString(ea.Body);
                    foreach (Action<string> action in ReceiveActionList)
                    {
                        action(message);
                    }                    
                };
                // 启动消费者
                _ReceiveChannel.BasicConsume(queue: ReceiveQueueName,
                                     noAck: true,
                                     consumer: consumer);

                return _ReceiveChannel;
            }
            catch (Exception se)
            {
                Debug.WriteLine(se.Message);
                Debug.WriteLine(se.StackTrace);
                return null;
            }
        }

        #endregion

        // 接收响应事件
        private List<Action<string>> ReceiveActionList = new List<Action<string>>();

        #region 公开的方法

        /// <summary>
        /// 添加消息到达响应方法
        /// </summary>
        /// <param name="action"></param>
        public void OnMessage(Action<string> action)
        {
            lock (ReceiveActionList)
            {
                ReceiveActionList.Add(action);
            }

            BuildReceiveChannel();
        }

        /// <summary>
        /// 向默认发送队列发送消息
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public bool SendMessage(string message)
        {
            return SendMessage(SendQueueName, message);
        }

        /// <summary>
        /// 向指定队列发送消息
        /// </summary>
        /// <param name="queueName"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public bool SendMessage(string queueName, string message)
        {
            var channel = GetSendChannel();
            if (channel == null) return false;

            try
            {
                if (SendQueueName != queueName)
                {
                    channel.QueueDeclare(queue: queueName,
                                    durable: Durable,   
                                    exclusive: false,
                                    autoDelete: false,
                                    arguments: null);
                }

                var body = Encoding.UTF8.GetBytes(message);

                // 发送消息
                channel.BasicPublish(exchange: "",
                                        routingKey: queueName,
                                        basicProperties: null,
                                        body: body);
                return true;
            }
            catch (Exception se)
            {
                Debug.WriteLine(se.Message);
                Debug.WriteLine(se.StackTrace);
                return false;
            }
        }

        /// <summary>
        /// 关闭通话器，一旦关闭，只能重建
        /// </summary>
        public void Close()
        {
            if (_Connection != null)
            {
                try
                {
                    _Connection.Close();
                    Debug.WriteLine("connect status : " + _Connection.IsOpen.ToString());
                }
                catch (Exception ce)
                {
                    Debug.WriteLine(ce.Message);
                }
            }
        }

        #endregion
    }

    class Program
    {
        static void Main(string[] args)
        {
            RabbitMQQueueTalker rmt = new RabbitMQQueueTalker(
                host: "localhost", 
                username: "guest", 
                password: "guest", 
                sendQueueName: "QueueTalk", 
                receiveQueueName: "QueueTalk", 
                durable: false);

            // 消息接收响应
            rmt.OnMessage(s => {
                Console.WriteLine(String.Format("receive message : {0}", s));
            }); 

            // 输入并发送消息
            while (true)
            {
                // input message
                string message = Console.ReadLine();
                if (rmt.SendMessage(message))
                {
                    Console.WriteLine("send message ：{0}", message);
                }
            }
        }
    }
}
