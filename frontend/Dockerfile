# 使用 Node.js 20 轻量版作为基础镜像
FROM node:20-slim

# 设置容器内的工作目录
WORKDIR /app

# 1. 首先只拷贝 package.json 和 package-lock.json
# 这样做是为了利用 Docker 的缓存机制：只要依赖没变，就不会重新执行耗时的 npm install
COPY package.json package-lock.json* ./

# 2. 安装依赖（包括 Three.js, Vue, Vite, GSAP 等）
# 使用 clean install 确保环境纯净
RUN npm install

# 3. 拷贝剩余的源代码
COPY . .

# 4. 暴露 Vite 默认的开发端口
EXPOSE 5173

# 5. 启动开发服务器
# --host 必须加上，否则 Docker 容器外的浏览器无法访问容器内的服务
CMD ["npm", "run", "dev", "--", "--host"]