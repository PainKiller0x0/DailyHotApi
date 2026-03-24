# 模块化路由配置

本项目支持模块化路由配置，可以按需启用或禁用特定的热榜接口，降低内存占用。

## 配置方式

### 方式一：使用 routes.config.json（推荐）

编辑 `src/routes.config.json` 文件，修改各路由的 `enabled` 字段：

```json
{
  "routes": {
    "weibo": {
      "enabled": true,   // 启用
      "name": "微博",
      "category": "社交"
    },
    "acfun": {
      "enabled": false,  // 禁用
      "name": "AcFun",
      "category": "视频"
    }
  }
}
```

### 方式二：使用环境变量

在 `.env` 文件中设置 `ENABLED_ROUTES`：

```bash
# 只启用指定的路由（逗号分隔）
ENABLED_ROUTES=weibo,zhihu,baidu,bilibili,douyin,toutiao,github,v2ex
```

**注意**：如果设置了 `ENABLED_ROUTES` 环境变量，将忽略 `routes.config.json` 中的配置。

## 默认启用的路由

以下路由默认启用（可在 routes.config.json 中修改）：

| 路由 | 名称 | 类别 |
|------|------|------|
| weibo | 微博 | 社交 |
| zhihu | 知乎 | 社交 |
| baidu | 百度 | 搜索 |
| bilibili | 哔哩哔哩 | 视频 |
| douyin | 抖音 | 视频 |
| toutiao | 今日头条 | 新闻 |
| github | GitHub | 技术 |
| v2ex | V2EX | 技术 |

## 查看路由状态

访问 `/all` 接口可以查看所有路由的状态：

```json
{
  "code": 200,
  "count": 8,        // 启用的路由数
  "total": 56,       // 总路由数
  "routes": [
    {
      "name": "weibo",
      "path": "/weibo",
      "enabled": true,
      "displayName": "微博",
      "category": "社交"
    },
    {
      "name": "acfun",
      "path": undefined,
      "enabled": false,
      "displayName": "AcFun",
      "category": "视频",
      "message": "This interface is disabled, enable it in routes.config.json"
    }
  ]
}
```

## 内存优化建议

### 低内存环境（< 512MB）
建议只启用 3-5 个常用路由：
```bash
ENABLED_ROUTES=weibo,zhihu,baidu,bilibili,douyin
```

### 中等内存环境（512MB - 1GB）
建议启用 8-15 个路由：
```bash
ENABLED_ROUTES=weibo,zhihu,baidu,bilibili,douyin,toutiao,github,v2ex,sspai,ithome,juejin
```

### 高内存环境（> 1GB）
可以启用所有需要的路由，或使用默认配置。

## 动态启用/禁用

修改配置后需要重启服务才能生效：

```bash
# 使用 PM2
pm2 restart dailyhot-api

# 使用 Docker
docker restart dailyhot-api
```

## 路由分类

所有路由按类别分类，方便批量启用/禁用：

| 类别 | 包含路由 |
|------|----------|
| 社交 | weibo, zhihu, tieba, douban-group, ngabbs, newsmth, hostloc, linuxdo |
| 视频 | bilibili, douyin, kuaishou, acfun |
| 新闻 | toutiao, thepaper, qq-news, sina, sina-news, netease-news, nytimes |
| 技术 | github, v2ex, sspai, ithome, 51cto, csdn, nodeseek, juejin, hellogithub, hackernews, producthunt |
| 游戏 | lol, miyoushe, genshin, honkai, starrail, ithome-xijiayi, gameres, yystv, ngabbs |
| 阅读 | weread, douban-movie, jianshu, zhihu-daily |
| 科技 | 36kr, huxiu, coolapk, ifanr, guokr, geekpark, dgtle |
| 生活 | weatheralarm, earthquake, history, smzdm, hupu |