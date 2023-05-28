# Hexo Theme Shoka

***

基于原主题修改：

1. 增加随机文章及最近评论数量的配置
  ```yml
  widgets:
    # if true, will show random posts
    random_posts: true
    # if true, will show recent comments
    recent_comments: true
    count: 3
  ```
2. 增加自定义脚本配置
```yml
# Custom Script Path
customJs:
  - /js/DateTimeAfeterCalc.js
```
3. 对随机图片做限制，避免同一页出现反复随机出同一张图片
4. CDN 换成国内的 staticfile 提供的 CDN(JSdeliver合并的版本感觉太慢了/现在经常访问不了了)
5. 主页 `cover` 展示图片以标签为准进行展示(而不是原来的分类)
6. 参考 [lavenderdh文章](https://www.lavenderdh.cn/posts/3928966287/) 把页顶图片放大至全屏了
7. 参考 [lavenderdh文章](https://www.lavenderdh.cn/posts/3265173701/) 以及 [eurkon文章](https://blog.eurkon.com/post/1213ef82.html) 增加文章统计支持功能
```yml
# statistics 文章统计功能
postStatistics:
  beginDate: 2015-12 #开始统计日期
  tagCount: 10 #统计标签个数
```

注意：还移除了一些用不上的插件(或者说兼容性东西，如polyfill)，以进行瘦身

config 增加了 nickname 配置

其它问题修改：

* ~~修改当页面内容过少，出现滑动底部一闪一闪的问题~~
* 修改页面进度百分比显示不准确问题

***

## Usage

1. Clone this repository

``` bash
# cd your-blog
git clone https://github.com/amehime/hexo-theme-shoka.git ./themes/shoka
```

2. Make changes to the root `_config.yml`
  - update `theme` fragment as `shoka`.  

3. Install the necessary plugins
  - [hexo-renderer-multi-markdown-it](https://www.npmjs.com/package/hexo-renderer-multi-markdown-it)
  - [hexo-autoprefixer](https://www.npmjs.com/package/hexo-autoprefixer)
  - [hexo-algoliasearch](https://www.npmjs.com/package/hexo-algoliasearch)
  - [hexo-symbols-count-time](https://www.npmjs.com/package/hexo-symbols-count-time)
  - [hexo-feed](https://www.npmjs.com/package/hexo-feed)

4. View a site configuration example in the `example` folder.

5. [中文使用说明](https://shoka.lostyu.me/computer-science/note/theme-shoka-doc/)
