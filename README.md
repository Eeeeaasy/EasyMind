# EasyMind

一个可以真正跑起来的智能客服调试工作台。

EasyMind 不是只有一个聊天输入框：它把 **对话、RAG 知识库、Agent 监控、评测和后端调试** 放在同一个工作台里。前端负责观察和操作，Python 后端负责思考和执行，Redis 记住短期上下文，ChromaDB 保存长期知识。

简单说：这是一个用来把 Agent 从“能回答”打磨到“可观察、可评测、可迭代”的小型实战项目。

## 先跑起来

项目分成两个目录：

```text
EasyMind/
├── EasyMindBackend/     # Python FastAPI 后端
├── EasyMindFrontend/    # Vue 3 + Vite 前端工作台
└── README.md
```

### 方式一：本地开发，不使用 Docker

适合改代码、调接口、看日志。需要本机准备 Python、Node.js、Redis 和 ChromaDB；如果暂时没有 Redis/ChromaDB，后端部分能力可能会降级，但完整对话链路建议把它们一起启动。

#### 1. 配置后端

```powershell
cd G:\myProject\AI\EasyMind\EasyMindBackend
Copy-Item .env.example .env
```

编辑 `.env`，至少填写：

```env
ANTHROPIC_API_KEY=你的模型API_KEY
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
ANTHROPIC_MODEL=deepseek-chat
REDIS_URL=redis://localhost:6379/0
CHROMA_HOST=localhost
CHROMA_PORT=8001
```

如果使用 Anthropic 官方接口，可以删除 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_MODEL`，使用默认配置。

#### 2. 创建 Python 环境并安装依赖

```powershell
cd G:\myProject\AI\EasyMind\EasyMindBackend
python -m venv .venv-win
.\.venv-win\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. 启动 Python 后端

```powershell
cd G:\myProject\AI\EasyMind\EasyMindBackend
.\.venv-win\Scripts\Activate.ps1
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

打开 Swagger：

```text
http://localhost:8000/docs
```

先检查健康状态：

```powershell
Invoke-RestMethod http://localhost:8000/health
```

#### 4. 启动 Vue 前端

另开一个终端：

```powershell
cd G:\myProject\AI\EasyMind\EasyMindFrontend
npm install
npm run dev
```

打开：

```text
http://localhost:5173
```

前端默认把 `/api/python` 代理到 `http://localhost:8000`。如果后端端口不同，可以这样启动：

```powershell
$env:VITE_PYTHON_API_URL="http://localhost:8001"
npm run dev
```

### 方式二：Docker 一键启动

适合联调和演示。前端 Compose 会统一启动：

- Python FastAPI
- Redis
- ChromaDB
- Vue 前端
- Nginx 网关

前提是 Docker Desktop 已启动：

```powershell
cd G:\myProject\AI\EasyMind\EasyMindFrontend
docker compose up -d --build
```

访问：

```text
http://localhost
```

查看服务：

```powershell
docker compose ps
docker compose logs -f easymind-python
```

停止服务：

```powershell
docker compose down
```

想连数据卷一起清掉时再使用：

```powershell
docker compose down -v
```

## 这套系统怎么工作

一次聊天请求大致经过这条链路：

```text
浏览器
  -> Vue 工作台
  -> /api/python/chat
  -> FastAPI
  -> 读取 Redis / ChromaDB 上下文
  -> 意图识别
  -> Agent 路由
  -> 工具调用 / 知识库检索
  -> 生成回复
  -> 写回记忆并返回 trace
```

前端当前提供这些工作区：

| 工作区 | 用途 |
| --- | --- |
| 对话 | 发送真实客服问题，查看 Agent 回复、路由信息和工具调用 |
| 知识库 | 搜索知识、添加文档、上传 `.txt` / `.md` / `.json` |
| 评测 | 运行端到端评测，查看通过率、评分和回归结果 |
| 调试 | 检查 Python 后端、用户 ID 和会话 ID |
| 监控 | 查看 Agent 请求量、成功率、耗时和路由评分 |

## 常用接口

后端接口都在 Python FastAPI 中：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/health` | 检查服务是否就绪 |
| `POST` | `/chat` | 主对话链路 |
| `POST` | `/search` | RAG 知识检索 |
| `GET` | `/knowledge/stats` | 查看知识片段数量 |
| `POST` | `/knowledge/add` | 添加知识文档 |
| `POST` | `/knowledge/upload` | 上传知识文件 |
| `GET` | `/monitor` | 获取 Agent 监控数据 |
| `POST` | `/eval/run` | 运行评测 |
| `GET` | `/docs` | Swagger API 文档 |

一个最小聊天请求：

```powershell
$body = @{
  message = "我想申请退款，订单号是 12345"
  user_id = "u1001"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:8000/chat `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## 开发时最常见的问题

### 页面打不开或一片黑

确认你是在前端目录启动：

```powershell
cd G:\myProject\AI\EasyMind\EasyMindFrontend
npm run dev
```

然后访问终端输出的地址。若 `5173` 被占用，Vite 可能会切换到 `5174`。

### 前端显示后端不可用

依次检查：

```powershell
Invoke-RestMethod http://localhost:8000/health
```

如果失败，先看后端终端日志。最常见原因是：

- 没有填写 `ANTHROPIC_API_KEY`
- Redis 没启动
- ChromaDB 地址仍然指向 Docker 服务名
- 使用了错误的 Python 环境

### PowerShell 激活虚拟环境失败

可以临时放开当前终端的脚本执行策略：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv-win\Scripts\Activate.ps1
```

### Docker 启动失败

先确认 Docker Desktop 正在运行：

```powershell
docker version
docker compose version
```

再看具体服务日志：

```powershell
docker compose logs -f easymind-python
```

## 项目命令速查

前端：

```powershell
cd EasyMindFrontend
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建结果
```

后端：

```powershell
cd EasyMindBackend
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
python -m compileall -q api agents core evaluation mcp memory monitor
```

## 安全提醒

不要把真实 API Key 提交到 Git。`.env` 只用于本地运行，提交前请确认它没有被加入版本控制；如果密钥已经出现在公开仓库或聊天记录中，应立即撤销并重新生成。

## 改造建议

如果你准备继续扩展这个项目，建议按下面的顺序推进：

1. 先让 `/health` 稳定返回，再调 `/chat`。
2. 给每次请求保留 `request_id`，这样前端 trace 和后端日志能对上。
3. 先补知识库测试，再调整 RAG 召回策略。
4. 用 `/eval/run` 建立一组固定回归问题，避免“改好了 A，弄坏了 B”。
5. 最后再优化 UI，不要让漂亮的按钮替代可观察性。

## License

内部学习与项目实践使用。
