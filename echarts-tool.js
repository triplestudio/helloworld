var EchartsTool = {};

EchartsTool.chartList = {};

// 初始化品牌分类的饼图
EchartsTool.pie = function (elementId, data, legend) {
    var myChart = this.chartList[elementId];

    // 存在时刷新
    if (myChart) {  
        var option = myChart.getOption();
        option.series[0].data = data;

        myChart.setOption(option);
        return;
    }
    // 基于准备好的dom，初始化echarts实例
    myChart = echarts.init(document.getElementById(elementId));
    this.chartList[elementId] = myChart;

    option = {
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)"
        },
        legend: { //图例组件，颜色和名字
            show: legend,
            x: '80%',
            y: 'center',
            orient: 'vertical',
            itemGap: 12, //图例每项之间的间隔
            itemWidth: 15,
            itemHeight: 10,
            icon: 'rect',
            textStyle: {
                color: [],
                fontStyle: 'normal',
                fontFamily: '微软雅黑',
                fontSize: 12,
            }
        },
        calculable: true,
        series: [
            {
                name: '数量',
                type: 'pie',
                radius: ['20%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                label: { //标签的位置
                    normal: {
                        show: true,
                        position: 'outer', //标签的位置
                        formatter: "{b}({c})",
                        textStyle: {
                            color: '#fff',
                        }
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontWeight: 'bold'
                        }
                    }
                },
                data: data
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
};

EchartsTool.mbar = function (elementId, data, type) { 
    var myChart = this.chartList[elementId]; 

    var ldims = [];
    var lnames = [];
    var values = [];

    for (var i = 0; i < data.length; i++) {
        var dim = data[i].dim;
        var name = data[i].name;
        var value = data[i].value;

        var indexDim = ldims.indexOf(dim);
        if (indexDim == -1) {
            indexDim = ldims.push(dim) - 1;
        }

        var serialIndex = lnames.indexOf(name);
        if (serialIndex == -1) {
            serialIndex = lnames.push(name) - 1;
            values[serialIndex] = [];
        }

        values[serialIndex][indexDim] = value;
    }

    var serials = [];
    for (var i = 0; i < lnames.length; i++) {

        for (var j = 0; j < ldims.length; j++) {
            if (!values[i][j]) values[i][j] = 0;
        }

        var s = {
            name: lnames[i],
            type: type || "bar",
            smooth: true,
            stack: "one",
            barWidth: "60%",
            data: values[i]
        };
        serials.push(s);
    }

    // 存在时刷新
    if (!myChart) {
        // 基于准备好的dom，初始化echarts实例
        myChart = echarts.init(document.getElementById(elementId));
        this.chartList[elementId] = myChart;
    }

    var option = {
        legend: { //图例组件，颜色和名字
            show: true,
            x: '79%',
            y: 'center',
            orient: 'vertical',
            itemGap: 12, //图例每项之间的间隔
            itemWidth: 15,
            itemHeight: 10,
            icon: 'rect',
            textStyle: {
                color: [],
                fontStyle: 'normal', 
                fontSize: 10,
            }
        },
        tooltip: {
            trigger: 'axis'
        },  
        grid: {
            left: '2%',
            right: '20%',
            top: '6%',
            bottom: '3%',
            containLabel: true
        },
        calculable: true,
        yAxis: {
            type: 'value',
            axisLabel: {
                textStyle: {
                    color: '#ccc',
                    fontSize: '12',
                },
                formatter: function (value, index) {
                    var value;
                    if (value >= 1000) {
                        value = value / 1000 + 'k';
                    } else if (value < 1000) {
                        value = value;
                    }
                    return value
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(160,160,160,0.3)',
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(160,160,160,0.3)',
                }
            }
        }, xAxis: [
            {
                type: 'category', 
                axisTick: { alignWithLabel: true }, 
                axisLabel: {
                    textStyle: {
                        color: '#ccc',
                        fontSize: '12'
                    },
                    lineStyle: {
                        color: '#2c3459',
                    }, 
                    rotate: 20,
                    formatter: function (params) {
                        //将最终的字符串返回
                        return params.substring(2, 6);
                    }

                },
                data: ldims
            }
        ],
        series: serials
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
};

EchartsTool.bar = function (elementId, data, type) {
    var myChart = this.chartList[elementId];

    var lnames = [];
    var values = [];

    for (var i = 0; i < data.length; i++) {
        lnames[i] = data[i].name;
        values[i] = data[i].value;
    }

    // 存在时刷新
    if (myChart) {
        var option = myChart.getOption();

        option.xAxis[0].data = lnames;
        option.series[0].data = values;

        myChart.setOption(option);
        return;
    }
    // 基于准备好的dom，初始化echarts实例
    myChart = echarts.init(document.getElementById(elementId));
    this.chartList[elementId] = myChart;

    var option = {

        tooltip: {
            trigger: 'axis'
        },
        color: ['#a4d8cc', '#25f3e6'],
        grid: {
            left: '3%',
            right: '4%',
            top: '12%',
            bottom: '5%',
            containLabel: true
        },
        calculable: true,
        yAxis: {
            type: 'value',
            axisLabel: {
                textStyle: {
                    color: '#ccc',
                    fontSize: '12',
                },
                formatter: function (value, index) {
                    var value;
                    if (value >= 1000) {
                        value = value / 1000 + 'k';
                    } else if (value < 1000) {
                        value = value;
                    }
                    return value
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(160,160,160,0.3)',
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(160,160,160,0.3)',
                }
            }
        }, xAxis: [
            {
                type: 'category',
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    textStyle: {
                        color: '#ccc',
                        fontSize: '12'
                    },
                    lineStyle: {
                        color: '#2c3459',
                    },
                    rotate: 20,
                    formatter: function (params) {
                        //将最终的字符串返回
                        return params;//.substring(2, 6);
                    }

                },
                data: lnames
            }
        ],
        series: [
            {
                type: type || "bar",
                smooth: true,
                barWidth: "50%",
                data: values,
                itemStyle: {
                    normal: {
                        label: {
                            show: true, //开启显示
                            position: 'top', //在上方显示
                            textStyle: { //数值样式
                                color: 'green',
                                fontSize: 14
                            }
                        }
                    }
                }
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
};
 
EchartsTool.bar3D = function (elementId, data) {
    /******************* 3D柱形图 ******************/

    var myChart = this.chartList[elementId];

    var ldims = [];
    var lnames = [];
    var values = [];

    for (var i = 0; i < data.length; i++) {
        var dim = data[i].dim;
        var name = data[i].name;
        var value = data[i].value;

        var indexDim = ldims.indexOf(dim);
        if (indexDim == -1) {
            indexDim = ldims.push(dim) - 1;
        }

        var indexName = lnames.indexOf(name);
        if (indexName == -1) {
            indexName = lnames.push(name);
        }

        var item = [indexDim, indexName, value];
        values.push(item);
    }

    // 存在时刷新
    if (myChart) {
        var option = myChart.getOption();

        option.series[0].data = values.map(function (item) {
            return {
                value: [item[1], item[0], item[2]]
            }
        });

        myChart.setOption(option);
        return;
    }
    // 基于准备好的dom，初始化echarts实例
    myChart = echarts.init(document.getElementById(elementId));
    this.chartList[elementId] = myChart;

    //初始化echarts实例
    const bar3D = myChart;
    const barOpt = {
        tooltip: {
            formatter: function (params) {
                let series = params.seriesName;
                let val = params.value;
                return series + '<br/>' +
                    days[val[1]] + '<br/>' +
                    hours[val[0]] + '<br/>值：' + val[2];
            }
        },
        visualMap: {
            max: 15,
            min: 1,
            calculable: true,
            inRange: {
                color: ['#50a3ba', '#eac736', '#d94e5d']
            },
            textStyle: {
                color: '#fff'
            }
        },
        grid3D: {
            boxWidth: 160,
            boxDepth: 80,
            viewControl: {
                distance: 300, //视觉距离
                autoRotate: false //自动旋转
            },
            light: { //光照配置
                main: {
                    intensity: 1.2,
                    shadow: true
                },
                ambient: {
                    intensity: 0.3
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#fff',
                    width: 1
                }
            },
            axisPointer: {
                show: false
            }
        },
        xAxis3D: {
            type: 'category',
            name: '',
            data: ldims
        },
        yAxis3D: {
            type: 'category',
            name: '',
            data: lnames
        },
        zAxis3D: {
            type: 'value',
            name: ''
        },
        series: [{
            type: 'bar3D',
            name: 'Bar3D',
            data: values.map(function (item) {
                return {
                    value: [item[1], item[0], item[2]]
                }
            }),
            shading: 'lambert',
            emphasis: {
                label: {
                    textStyle: {
                        fontSize: 16,
                        color: '#900'
                    }
                },
                itemStyle: {
                    color: '#900'
                }
            }
        }]
    };
    //渲染图表
    bar3D.setOption(barOpt);
     
    window.addEventListener("resize", function () {
        myChart.resize();
    });
};