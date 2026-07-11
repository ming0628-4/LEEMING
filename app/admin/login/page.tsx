export const metadata = { title: "管理员登录" };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; return_to?: string }>;
}) {
  const { error, return_to: returnTo = "/admin" } = await searchParams;

  return (
    <main className="shell page narrow">
      <p className="eyebrow">LEEMING Admin</p>
      <h1>管理员登录</h1>
      <p className="page-lead">
        这里是 LEEMING 的资源维护入口。普通访客不需要登录，只有管理员需要输入密码。
      </p>
      <form className="admin-login-form" action="/api/admin/login" method="post">
        <input type="hidden" name="return_to" value={returnTo} />
        <label>
          管理员密码
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="输入管理员密码"
            required
          />
        </label>
        {error ? <p className="form-error">密码不正确，请重新输入。</p> : null}
        <button className="primary-button" type="submit">
          登录后台
        </button>
      </form>
    </main>
  );
}
