# CogniTrace

## 如何获取仓库 Token / How to Get a Repository Token

要通过 API 或命令行访问本仓库，您需要一个 GitHub 个人访问令牌（Personal Access Token，PAT）。

To access this repository via API or command line, you need a GitHub Personal Access Token (PAT).

---

### 步骤 / Steps

#### 1. 登录 GitHub / Log in to GitHub

前往 [https://github.com](https://github.com) 并登录您的账号。

Go to [https://github.com](https://github.com) and sign in to your account.

#### 2. 进入 Token 设置页面 / Go to Token Settings

- 点击右上角头像 → **Settings（设置）**
- 左侧菜单滚动至底部，点击 **Developer settings（开发者设置）**
- 点击 **Personal access tokens** → **Tokens (classic)** 或 **Fine-grained tokens**

- Click your avatar in the top-right corner → **Settings**
- Scroll to the bottom of the left sidebar and click **Developer settings**
- Click **Personal access tokens** → **Tokens (classic)** or **Fine-grained tokens**

#### 3. 生成新 Token / Generate a New Token

- 点击 **Generate new token（生成新令牌）**
- 填写备注（Note），例如：`CogniTrace access`
- 设置过期时间（Expiration）
- 根据需要勾选权限（Scopes）：
  - `repo` — 访问私有仓库（如本仓库为私有）
  - `read:org` — 读取组织信息（如需要）

- Click **Generate new token**
- Enter a note, e.g., `CogniTrace access`
- Set an expiration date
- Select the required scopes:
  - `repo` — Access private repositories (if this repo is private)
  - `read:org` — Read organization data (if needed)

#### 4. 复制并保存 Token / Copy and Save the Token

> ⚠️ **Token 只会显示一次，请立即复制并妥善保存！**
>
> ⚠️ **The token is only shown once. Copy and store it immediately!**

---

### 使用 Token / Using the Token

#### 推荐方式：使用 GitHub CLI / Recommended: GitHub CLI

```bash
# 安装 GitHub CLI 后执行 / After installing GitHub CLI
gh auth login
git clone https://github.com/irenefff/CogniTrace.git
```

#### 通过环境变量设置 / Set via Environment Variable

```bash
export GITHUB_TOKEN=<YOUR_TOKEN>
```

#### 通过系统凭据管理器 / Use System Credential Manager（推荐 / Recommended）

```bash
# macOS
git config --global credential.helper osxkeychain

# Windows
git config --global credential.helper wincred

# Linux（临时缓存，默认 15 分钟 / temporary cache, default 15 min）
git config --global credential.helper cache
```

首次 `git push` 或 `git pull` 时输入用户名和 Token，凭据将被安全存储。

On first `git push` or `git pull`, enter your username and Token — credentials will be stored securely.

> ⚠️ **避免将 Token 直接嵌入 URL（如 `https://<token>@github.com/...`），这会在 shell 历史记录和日志中暴露 Token。**
>
> ⚠️ **Avoid embedding tokens directly in URLs (e.g., `https://<token>@github.com/...`), as this exposes the token in shell history and logs.**

---

### 参考链接 / References

- [GitHub 官方文档 – 创建个人访问令牌](https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Docs – Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
