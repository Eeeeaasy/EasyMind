# EasyMind Frontend

独立 Vue 前端项目，连接 EasyMind Python 版本。


```text
./EasyMindFrontend
```

## 功能

  - Python：`conv_id`、`agent_type`、`latency_ms`
- 支持聊天调试、健康检查、监控摘要、知识库检索、知识库文档导入、文件上传。

## 默认后端地址

| 后端 | 默认地址 |
|------|----------|
| Python | `http://localhost:8000` |

开发模式下，Vite 会代理：

| 前端路径 | 代理到 |
|----------|--------|
| `/api/python` | `http://localhost:8000` |

Docker 模式下，Nginx 会通过运行时注入的地址访问 Python 服务。

## 本地运行

安装依赖：

```bash
npm install
```

启动：

```bash
npm run dev
```

访问：

```text
http://localhost:5173
```

如果后端端口不是默认值，可以启动时覆盖：

```bash
VITE_PYTHON_API_URL=http://localhost:8000 \
npm run dev
```

## Docker 部署

直接构建并启动三服务：

```bash
docker compose up -d --build
```

前提是 `EasyMindFrontend` 的父目录下有这两个目录：

```text
../EasyMindBackend
./
```

访问前端：

```text
http://localhost
```

如果只想暴露前端端口，可改 `FRONTEND_PORT`，默认仍可通过 `80` 统一入口访问。

停止：

```bash
docker compose down
```

## 后端启动参考

Python 版默认：

```text
http://localhost:8000
```

前端只连接 Python 后端，不需要额外选择后端。
