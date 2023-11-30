# 目标
建立一个管理自己的用户信息的服务，为其他服务提供用户信息、权限服务。

# 功能
- 这是一个用户管理系统
- 管理员去管理各系统，为各系统管理角色，为用户分配角色。
- 由管理员创建系统，及其操作员。操作员读取系统信息，管理该系统的用户。
- 注册，登录
- 提供用户信息、权限。

# 接入方法

其他系统使用本系统登录、注册页面。
登录或注册成功后replace到其他系统。
后端使用open api取得用户信息+权限。然后内部自己处理相关逻辑。

```
        client              各service               sso
    登录
    输入用户信息
    请求登录 -------------------------------------> 验证
                                                生成2个token
            <--------------------------------- 返回token+expires
    在ls中存token+expires
    login ------------------> 取出token
                                -----------------> 验证
                                                返回用户信息
                            存入session <---------
        <---------------------- ok

    注册
    输入用户信息 -----------------------------------> 验证
                                                生成2个token
           <----------------------------------- 返回token+expires
    存 token
    请求注册 -----------------> 取出token
                                ------------------> 验证
                                                返回用户信息
                            存入session <-----------
        <---------------------- ok

    业务中的接口
    使用access_token请求 --->
                            判断session中是否已记录用户信息
                            |           |
                            |Y          |N
                            V           |
                判断access_token是否相同  |
                再判断是否在有效期  |N     |
                   Y|   |N       |      V
                    |   |--------->  使用access_token
                    |               请求用户信息 ----> 验证是否有效
                    |                    <---------- 返回用户信息
                    |               保存在session中
                    |--------|---------|
                             |
                             V
                        处理逻辑
    <-------------------返回结果
    处理逻辑

    前端更新token
    当快过期时
    使用access_token+refresh_token请求 ---------> 验证
                                                生成新token*2
    在ls中存token+expires <---------------------- 返回数据

    请求登出 -----------------------------------> 验证
                                            在数的库中标记已经登出
       <--------------------------------------- 返回
    在ls中删除数据
    处理逻辑
```

参考[刷新token的方法](http://lixiaodan.org/confuse/session&jwt.html)

## 前端
1. 自己开发登录、注册页面
2. 使用用户信息向sso请求token
3. 在ls中保存token+expires
4. 在之后的请求头中使用access_token
5. 当快过期时使用2个token请求新token
6. 在ls中保存token+expires

示例代码
```js

```

## 后端
1. 在session中记录用户信息
2. 处理逻辑

示例代码
```js
let reqUser = (req) => {
    return req({url, method, data}).then((response) => {
        req.session.user = {
            profile: response.profile,
            promission: response.promission,
            router: response.router,
            access_token: response.access_token,
            refresh_token: response.refresh_token,
        }
        return
    })
}
function (req, res, next) {
    if (req.session.user) {
        if (req.session.user.access_token === req.headers.authorization) {
            next()
        } else {
            reqUser(req).then(() => {
                next()
            })
        }
    } else {
        reqUser(req).then(() => {
            next()
        })
    }
    next()
}
// 在接口中使用此中间件
```

# 设计原理
## 数据结构
用户表
users
    name string
    <!-- account string -->
    email string
    id ULID
    password string
    password_hash string
    systems: [
        {
            id number // 系统的id
            role_list number[] // 当前用户的角色Id
            route_list number[] // 当前用户的路由Id
        }
    ]
    <!-- permission: number[] // 权限id组成的数组 -->
    <!-- roles: [] // 角色id -->
    <!-- router: number[] -->

系统表
systems
    key string
    id number
    name string
    roles_id number[] // 当前系统的所有角色
    router_id number[]
    env // 环境

角色表
roles
    name string
    id number // 当前角色的id
    system_id // 所属系统的id
    permissions: [] // 权限id

路由表
routes
    id number
    sub_router_id number // 子路由id
    key string
    name string

权限表
permissions
    table_id number
    id number
    key number 1:read 2:write 3:read+write
    descriptioin read | write

表表
tables
    id number
    key string
    name string

黑名单
black_list
    userId
    expires

# api

## sign
post /sign
data: {
    account string
    password string
}
response: {
    code: 0
    message: ''
    data: {}
}
```
    account是否存在
        |
        |Y
        V
    初始化用户profile
    roles
    router
    保存在users表中
    生成2个token并返回
```

## login
post /login
data: {
    account string
    password string
}
response: {
    code: 0
    message: '',
    data: {
        access_token,
        refresh_token,
    }
}
```
    查询用户
    加密userId
    使用加密后userId，生成access_token，指定有效时间
    使用加密后access_token，生成refresh_token
    返回2个token
```

## logout
delete /logout
header: {
    authentication: accessToken
}
data: {
    account string
}
response: {
    code: 0
    message: ''
    data: {}
}
```
    验签token，得到userId.
    在黑名单中增加一条数据（userId，expires）
```

## authUserInfo
post /authUserInfo
data: {
    accessToken string
    systemId number // 系统的id
}
response: {
    code: 0
    message: ''
    data: {
        profile: {
            name string
            account string
            email string
        }
        promission: [{tableId, key, description}]
        roles: [{name, id, systemId, permission: []}]
        router: [{}]
        accessToken
    }
}
```
    验签token,得到userId。
    判断是否登出
    返回用户信息
```

## refreshToken
put /refreshToken
data: {
    accessToken
    refreshToken
}
response: {
    code: 0
    message: ''
    data: {
        accessToken
        refreshToken
    }
}
```
    验签access_token,得到userId,
    判断是否登出
    判断2个token是否匹配
    返回2个新token
```

## permission
修改权限
put /permission
data: {
    userId string
    rolesId number[]
}
response: {
    code: 0
    message: ''
    data: {}
}
```
    修改用户角色（覆盖）
```

# error code
详见配置文件

|错误码值|说明||
|-|-|-|
|100100|请求参数错误|要求字段必传|
|100110|账号密码不匹配||
||||

# todo
不同环境
每30min清一次黑名单
