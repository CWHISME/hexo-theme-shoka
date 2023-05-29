'use strict';

const cheerio = require('cheerio')
const moment = require('moment')

hexo.extend.filter.register('after_render:html', function (locals) {
  const $ = cheerio.load(locals)
  const init = $('#echarts-init')
  let htmlEncode = false
  //无初始化，跳过
  if (init.length > 0 ) {
    if($('#echartsInit').length === 0){
      if (init.attr('data-encode') === 'true') htmlEncode = true
      init.after(echartsInit())
    }
  }else return locals;

  const calendar = $('#posts-calendar')
  const post = $('#posts-chart')
  const tag = $('#tags-chart')
  const category = $('#categories-chart')
  if (calendar.length > 0 || post.length > 0 || tag.length > 0 || category.length > 0) {
    if (calendar.length > 0 && $('#postsCalendar').length === 0) {
      if (calendar.attr('data-encode') === 'true') htmlEncode = true
      calendar.after(postsCalendar())
    }
    if (post.length > 0 && $('#postsChart').length === 0) {
      if (post.attr('data-encode') === 'true') htmlEncode = true
      post.after(postsChart())
    }
    if (tag.length > 0 && $('#tagsChart').length === 0) {
      if (tag.attr('data-encode') === 'true') htmlEncode = true
      tag.after(tagsChart(hexo.theme.config.postStatistics.tagCount))
    }
    if (category.length > 0 && $('#categoriesChart').length === 0) {
      if (category.attr('data-encode') === 'true') htmlEncode = true
      category.after(categoriesChart())
    }
    if (htmlEncode) {
      return $.root().html().replace(/&amp;#/g, '&#')
    } else {
      return $.root().html()
    }
  } else {
    return locals
  }
}, 15)

function echartsInit(){
  return `
  <script id="echartsInit">
    function switchPostChart () {
      // 这里为了统一颜色选取的是 “明暗模式” 下的两种字体颜色，也可以自己定义
      let color = document.documentElement.getAttribute('data-theme') === null ? '#fff' : '#000'
      if (document.getElementById('posts-calendar')) {
          let postsCalendarNew = postsCalendarOption
          postsCalendarNew.textStyle.color = color
          postsCalendarNew.title.textStyle.color = color
          postsCalendarNew.visualMap.textStyle.color = color
          postsCalendarNew.calendar.itemStyle.color = color
          postsCalendarNew.calendar.yearLabel.color = color
          postsCalendarNew.calendar.monthLabel.color = color
          postsCalendarNew.calendar.dayLabel.color = color
          postsCalendar.setOption(postsCalendarNew)
      }
      if (document.getElementById('posts-chart')) {
          let postsOptionNew = postsOption
          postsOptionNew.textStyle.color = color
          postsOptionNew.title.textStyle.color = color
          postsOptionNew.xAxis.axisLine.lineStyle.color = color
          postsOptionNew.yAxis.axisLine.lineStyle.color = color
          postsChart.setOption(postsOptionNew)
      }
      if (document.getElementById('tags-chart')) {
          let tagsOptionNew = tagsOption
          tagsOptionNew.textStyle.color = color
          tagsOptionNew.title.textStyle.color = color
          tagsOptionNew.xAxis.axisLine.lineStyle.color = color
          tagsOptionNew.yAxis.axisLine.lineStyle.color = color
          tagsChart.setOption(tagsOptionNew)
      }
      if (document.getElementById('categories-chart')) {
          let categoriesOptionNew = categoriesOption
          categoriesOptionNew.textStyle.color = color
          categoriesOptionNew.title.textStyle.color = color
          categoriesOptionNew.legend.textStyle.color = color
          categoriesChart.setOption(categoriesOptionNew)
      }
  }
  document.getElementsByClassName("theme")[0].addEventListener("click", function () { setTimeout(switchPostChart, 200) });
  function venderJs(callback)
  {
    if(window['echartload'])
    {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.onload = script.onreadystatechange = function() {
      script.onload = script.onreadystatechange = null;
      script = undefined;
      callback();
    };
    script.src = '${hexo.theme.config.vendors.js.echart}';
    window['echartload']=true;
    document.head.appendChild(script);
  }
  venderJs(function(){
    Do_postsCalendar();
    Do_postsChart();
    Do_tagsChart();
    Do_categoriesChart();
  })
  `;
}

function postsCalendar () {
  // calculate range.
  const start_date = moment().subtract(1, 'years'); //moment(hexo.theme.config.postStatistics.beginDate) //
  const end_date = moment();
  const rangeArr = '["' + start_date.format('YYYY-MM-DD') + '", "' + end_date.format('YYYY-MM-DD') + '"]';

  // post and count map.
  var dateMap = new Map();
  hexo.locals.get('posts').forEach(function (post) {
      var date = post.date.format('YYYY-MM-DD');
      var count = dateMap.get(date);
      dateMap.set(date, count == null || count == undefined ? 1 : count + 1);
  });

  // loop the data for the current year, generating the number of post per day
  var i = 0;
  var datePosts = '[';
  var day_time = 3600 * 24 * 1000;
  for (var time = start_date; time <= end_date; time += day_time) {
      var date = moment(time).format('YYYY-MM-DD');
      datePosts = (i === 0 ? datePosts + '["' : datePosts + ', ["') + date + '", '
              + (dateMap.has(date) ? dateMap.get(date) : 0) + ']';
      i++;
  }
  datePosts += ']';

  return `
  <script id="postsCalendar">
  function Do_postsCalendar(){
    var color = document.documentElement.getAttribute('data-theme') === null ? '#000' : '#fff'
    var postsCalendar = echarts.init(document.getElementById('posts-calendar'), 'light');
    var postsCalendarOption = {
      textStyle: {
        color: color
      },
      title: {
          top: 0,
          text: '文章发布日历',
          left: 'center',
          textStyle: {
              color: color
          }
      },
      tooltip: {
          formatter: function (obj) {
              var value = obj.value;
              return '<div style="font-size: 14px;">' + value[0] + '：' + value[1] + '</div>';
          }
      },
      visualMap: {
          show: true,
          showLabel: true,
          categories: [0, 1, 2, 3, 4],
          calculable: true,
          textStyle:{
            color: color
          },
          inRange: {
              symbol: 'rect',
              color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
          },
          itemWidth: 12,
          itemHeight: 12,
          orient: 'horizontal',
          left: 'center',
          bottom: 80
      },
      calendar: {
          left: 'center',
          range: ${rangeArr},
          left: 55,
          cellSize: ['auto', 13],
          splitLine: {
              show: true
          },
          itemStyle: {
              color: '#111',
              borderColor: '#fff',
              borderWidth: 2
          },
          yearLabel: {
              formatter: '{start} ~ {end}',
              show: true,
              color: color
          },
          monthLabel: {
              nameMap: 'cn',
              fontSize: 11,
              color: color
          },
          dayLabel: {
              formatter: '{start}  1st',
              nameMap: 'cn',
              fontSize: 11,
              color: color
          }
      },
      series: [{
          type: 'heatmap',
          coordinateSystem: 'calendar',
          calendarIndex: 0,
          data: ${datePosts}
      }]
    };
    postsCalendar.setOption(postsCalendarOption);
    window.addEventListener("resize", () => { 
      postsCalendar.resize();
    });
  }
    </script>`
}

function postsChart () {
  const startDate = moment(hexo.theme.config.postStatistics.beginDate)  // 开始统计的时间
  const endDate = moment()

  const monthMap = new Map()
  const dayTime = 3600 * 24 * 1000
  for (let time = startDate; time <= endDate; time += dayTime) {
    const month = moment(time).format('YYYY-MM')
    if (!monthMap.has(month)) {
      monthMap.set(month, 0)
    }
  }
  hexo.locals.get('posts').forEach(function (post) {
    const month = post.date.format('YYYY-MM')
    if (monthMap.has(month)) {
      monthMap.set(month, monthMap.get(month) + 1)
    }
  })
  const monthArr = JSON.stringify([...monthMap.keys()])
  const monthValueArr = JSON.stringify([...monthMap.values()])
  
    return `
    <script id="postsChart">
    function Do_postsChart(){
      var color = document.documentElement.getAttribute('data-theme') === null ? '#000' : '#fff'
      var postsChart = echarts.init(document.getElementById('posts-chart'), 'light');
      var postsOption = {
        textStyle: {
          color: color
        },
        title: {
          text: '文章发布统计图',
          x: 'center',
          textStyle: {
            color: color
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          name: '日期',
          type: 'category',
          axisTick: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: color
            }
          },
          data: ${monthArr}
        },
        yAxis: {
          name: '文章篇数',
          type: 'value',
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: color
            }
          }
        },
        series: [{
          name: '文章篇数',
          type: 'line',
          smooth: true,
          lineStyle: {
              width: 0
          },
          showSymbol: false,
          itemStyle: {
            opacity: 1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(128, 255, 165)'
            },
            {
              offset: 1,
              color: 'rgba(253, 187, 236)'
            }])
          },
          areaStyle: {
            opacity: 1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(128, 255, 165)'
            }, {
              offset: 1,
              color: 'rgba(253, 187, 236)'
            }])
          },
          data: ${monthValueArr},
          markLine: {
            data: [{
              name: '平均值',
              type: 'average'
            }]
          }
        }]
      };
      postsChart.setOption(postsOption);
      window.addEventListener("resize", () => { 
        postsChart.resize();
      });
    }
      </script>`
}

function tagsChart (len) {
  const tagArr = []
  hexo.locals.get('tags').map(function (tag) {
    tagArr.push({ name: tag.name, value: tag.length })
  })
  tagArr.sort((a, b) => { return b.value - a.value })

  let dataLength = Math.min(tagArr.length, len) || tagArr.length
  const tagNameArr = []
  const tagCountArr = []
  for (let i = 0; i < dataLength; i++) {
    tagNameArr.push(tagArr[i].name)
    tagCountArr.push(tagArr[i].value)
  }
  const tagNameArrJson = JSON.stringify(tagNameArr)
  const tagCountArrJson = JSON.stringify(tagCountArr)

  return `
  <script id="tagsChart">
  function Do_tagsChart(){
    var color = document.documentElement.getAttribute('data-theme') === null ? '#000' : '#fff'
    var tagsChart = echarts.init(document.getElementById('tags-chart'), 'light');
    var tagsOption = {
      textStyle: {
        color: color
      },
      title: {
        text: 'Top ${dataLength} 标签统计图',
        x: 'center',
        textStyle: {
          color: color
        }
      },
      tooltip: {},
      xAxis: {
        name: '标签',
        type: 'category',
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: color
          }
        },
        data: ${tagNameArrJson}
      },
      yAxis: {
        name: '文章篇数',
        type: 'value',
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: color
          }
        }
      },
      series: [{
        name: '文章篇数',
        type: 'bar',
        data: ${tagCountArrJson},
        itemStyle: {
          opacity: 1,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(171, 201, 255)'
          },
          {
            offset: 1,
            color: 'rgba(253, 187, 236)'
          }])
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(171, 201, 255)'
            },
            {
              offset: 1,
              color: 'rgba(253, 187, 236)'
            }])
          }
        },
        markLine: {
          data: [{
            name: '平均值',
            type: 'average'
          }]
        }
      }]
    };
    tagsChart.setOption(tagsOption);
    window.addEventListener("resize", () => { 
      tagsChart.resize();
    });
  }
    </script>`
}

function categoriesChart () {
  const categoryArr = []
  hexo.locals.get('categories').map(function (category) {
    categoryArr.push({ name: category.name, value: category.length })
  })
  categoryArr.sort((a, b) => { return b.value - a.value });
  const categoryArrJson = JSON.stringify(categoryArr)

  return `
  <script id="categoriesChart">
  function Do_categoriesChart(){
    var color = document.documentElement.getAttribute('data-theme') === null ? '#000' : '#fff'
    var categoriesChart = echarts.init(document.getElementById('categories-chart'), 'light');
    var categoriesOption = {
      textStyle: {
        color: color
      },
      title: {
        text: '文章分类统计图',
        x: 'center',
        textStyle: {
          color: color
        }
      },
      legend: {
        top: '85%',
        textStyle: {
          color: color
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      series: [{
        name: '文章篇数',
        type: 'pie',
        radius: ['20%', '50%'],
        // radius: [30, 80],
        center: ['50%', '45%'],
        roseType: 'area',
        label: {
          formatter: "{b} : {c} ({d}%)"
        },
        data: ${categoryArrJson},
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(255, 255, 255, 0.5)'
          }
        }
      }]
    };
    categoriesChart.setOption(categoriesOption);
    window.addEventListener("resize", () => { 
      categoriesChart.resize();
    });
  }
    </script>`
}