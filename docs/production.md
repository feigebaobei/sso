# 定位
统一管理用户信息。

# 功能
- 增删改查用户信息
- 设置指定角色在指定系统的权限
- 提供sso服务
- 支持使用sso的登录、注册页面和使用服务自己的登录、注册页面。
- 3min内连接失败3次，则停止服务10min.

# 用例

```
    sso              service                 client
                          <----------------- 请求注册
      <------------- 请求注册
  保存在数据库
生成并返回accessToken/refreshToken
    ---------------> 保存在session中
                    返回at/rt ----------------> 保存at/rt在ls中

                          <---------------- 2h内请求刷新token
       <------------ 请求
    验证有效性
    返回新token ------>返回新token -----------> 保存at/rt在ls中

                          <---------------- 2h外请求刷新token
        <------------ 请求
    验证有效性
    返回失败 ---------->  -------------------> 进入login页面


```