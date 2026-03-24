import { fileURLToPath } from "url";
import { config } from "./config.js";
import { Hono } from "hono";
import getRSS from "./utils/getRSS.js";
import path from "path";
import fs from "fs";

const app = new Hono();

// 模拟 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 路由数据
let allRoutePath: Array<string> = [];
const routersDirName: string = "routes";

// 排除路由
const excludeRoutes: Array<string> = [];

// 加载路由配置
const loadRoutesConfig = (): Record<string, { enabled: boolean; name: string; category: string }> => {
  const configPath = path.join(__dirname, "routes.config.json");
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return configData.routes || {};
  }
  return {};
};

// 获取启用的路由列表
const getEnabledRoutes = (): string[] => {
  // 如果环境变量指定了启用的路由，使用环境变量
  if (config.ENABLED_ROUTES) {
    return config.ENABLED_ROUTES.split(",").map((r) => r.trim()).filter(Boolean);
  }
  
  // 否则从配置文件中读取默认启用的路由
  const routesConfig = loadRoutesConfig();
  return Object.entries(routesConfig)
    .filter(([_, config]) => config.enabled)
    .map(([name]) => name);
};

// 建立完整目录路径
const routersDirPath = path.join(__dirname, routersDirName);

// 递归查找函数
const findTsFiles = (dirPath: string, allFiles: string[] = [], basePath: string = ""): string[] => {
  // 读取目录下的所有文件和文件夹
  const items: Array<string> = fs.readdirSync(dirPath);
  // 遍历每个文件或文件夹
  items.forEach((item) => {
    const fullPath: string = path.join(dirPath, item);
    const relativePath: string = basePath ? path.posix.join(basePath, item) : item;
    const stat: fs.Stats = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // 如果是文件夹，递归查找
      findTsFiles(fullPath, allFiles, relativePath);
    } else if (
      stat.isFile() &&
      (item.endsWith(".ts") || item.endsWith(".js")) &&
      !item.endsWith(".d.ts")
    ) {
      // 符合条件
      allFiles.push(relativePath.replace(/\.(ts|js)$/, ""));
    }
  });
  return allFiles;
};

// 获取全部路由
if (fs.existsSync(routersDirPath) && fs.statSync(routersDirPath).isDirectory()) {
  allRoutePath = findTsFiles(routersDirPath);
} else {
  console.error(`📂 The directory ${routersDirPath} does not exist or is not a directory`);
}

// 获取启用的路由
const enabledRoutes = getEnabledRoutes();
const disabledRoutes = allRoutePath.filter((route) => !enabledRoutes.includes(route));

console.log(`🎯 Enabled routes (${enabledRoutes.length}/${allRoutePath.length}):`, enabledRoutes.join(", "));
if (disabledRoutes.length > 0) {
  console.log(`⏸️  Disabled routes (${disabledRoutes.length}):`, disabledRoutes.join(", "));
}

// 注册全部路由
for (let index = 0; index < allRoutePath.length; index++) {
  const router = allRoutePath[index];
  // 是否处于排除名单
  if (excludeRoutes.includes(router)) {
    continue;
  }
  // 是否处于禁用名单
  if (!enabledRoutes.includes(router)) {
    continue;
  }
  const listApp = app.basePath(`/${router}`);
  // 返回榜单
  listApp.get("/", async (c) => {
    // 是否采用缓存
    const noCache = c.req.query("cache") === "false";
    // 限制显示条目
    const limit = c.req.query("limit");
    // 是否输出 RSS
    const rssEnabled = c.req.query("rss") === "true";
    // 获取路由路径
    const { handleRoute } = await import(`./routes/${router}.js`);
    const listData = await handleRoute(c, noCache);
    // 是否限制条目
    if (limit && listData?.data?.length > parseInt(limit)) {
      listData.total = parseInt(limit);
      listData.data = listData.data.slice(0, parseInt(limit));
    }
    // 是否输出 RSS
    if (rssEnabled || config.RSS_MODE) {
      const rss = getRSS(listData);
      if (typeof rss === "string") {
        c.header("Content-Type", "application/xml; charset=utf-8");
        return c.body(rss);
      } else {
        return c.json({ code: 500, message: "RSS generation failed" }, 500);
      }
    }
    return c.json({ code: 200, ...listData });
  });
  // 请求方式错误
  listApp.all("*", (c) => c.json({ code: 405, message: "Method Not Allowed" }, 405));
}

// 获取全部路由
app.get("/all", (c) => {
  const routesConfig = loadRoutesConfig();
  return c.json(
    {
      code: 200,
      count: enabledRoutes.length,
      total: allRoutePath.length,
      routes: allRoutePath.map((routePath) => {
        // 是否处于排除名单
        if (excludeRoutes.includes(routePath)) {
          return {
            name: routePath,
            path: undefined,
            enabled: false,
            message: "This interface is temporarily offline",
          };
        }
        // 是否启用
        const isEnabled = enabledRoutes.includes(routePath);
        const routeInfo = routesConfig[routePath] || {};
        return {
          name: routePath,
          path: isEnabled ? `/${routePath}` : undefined,
          enabled: isEnabled,
          displayName: routeInfo.name || routePath,
          category: routeInfo.category || "其他",
          message: isEnabled ? undefined: "This interface is disabled, enable it in routes.config.json",
        };
      }),
    },
    200,
  );
});

export default app;
