# sso
单点登录系统

# 技术栈
- ndoe(express)
- ts
- yarn
## 依赖
```
<!-- 根据项目真实引用的文件，安装依赖。 -->
yarn add cors dotenv jsonwebtoken md5 mongodb morgan node-schedule nodemailer pino rotating-file-stream ts-node ulid




yarn add jsonwebtoken crypto
yarn add pino
yarn add nodemailer



```

# 启动
```
npm run dev
```

# [产品文档](./docs/production.md)
# [技术文档](./docs/technology.md)

# todo
重构ts为js


# aliyun部署流程
<!-- todo 已经成为js了，会改变的。 -->
1. 在功能分支上开发新功能。
2. 在github上合并到master.
3. 在aliyun上的相应目标拉取master分支代码。
4. 执行`npx tsc`
5. 执行`pm2 restart $xx`$xx是sso服务对应的id。
