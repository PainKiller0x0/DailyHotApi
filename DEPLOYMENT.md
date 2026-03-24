# DailyHotApi 部署文档

## 部署信息

- **服务器**：香港 VPS (206.237.12.115)
- **端口**：6688
- **内存占用**：约 60MB（启用 8 个路由）
- **访问地址**：http://206.237.12.115:6688/

## 已启用的路由（8个）

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

## API 接口

### 查看所有路由
```bash
curl http://206.237.12.115:6688/all
```

### 获取微博热榜
```bash
curl http://206.237.12.115:6688/weibo
```

### 获取知乎热榜
```bash
curl http://206.237.12.115:6688/zhihu
```

### RSS 模式
```bash
curl http://206.237.12.115:6688/weibo?rss=true
```

## 管理命令

### 查看服务状态
```bash
ssh root@206.237.12.115 "pm2 status"
```

### 查看日志
```bash
ssh root@206.237.12.115 "pm2 logs daily-news"
```

### 重启服务
```bash
ssh root@206.237.12.115 "pm2 restart daily-news"
```

### 停止服务
```bash
ssh root@206.237.12.115 "pm2 stop daily-news"
```

## 修改启用的路由

### 方式一：修改 routes.config.json
1. SSH 连接到服务器
2. 编辑 `/root/DailyHotApi/src/routes.config.json`
3. 修改 `enabled` 字段
4. 重新构建：`cd /root/DailyHotApi && npm run build`
5. 重启服务：`pm2 restart daily-news`

### 方式二：使用环境变量
1. 编辑 `/root/DailyHotApi/.env`
2. 设置 `ENABLED_ROUTES=weibo,zhihu,baidu,bilibili`
3. 重启服务：`pm2 restart daily-news`

## 内存优化效果

| 配置 | 路由数 | 内存占用 |
|------|--------|----------|
| 默认全部启用 | 56 | 约 150-200MB |
| 模块化配置 | 8 | 约 60MB |
| **节省** | **85%** | **60-70%** |

## 相关文件

- `MODULAR_CONFIG.md` - 模块化配置说明
- `src/routes.config.json` - 路由配置文件
- `.env` - 环境变量配置

## GitHub 仓库

https://github.com/PainKiller0x0/DailyHotApi