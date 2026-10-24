import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, Loader2Icon, LockIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { DemoAccounts } from '../components/DemoAccounts';
import { buildTornEdgeClipPath } from '../utils/tornEdge';

const LOGO = "/Logo_Bo_Cong_an_VN.png";
const BACKGROUND = 'url(https://cdn.magicpatterns.com/uploads/1eFWxqsvfBjqxn4CvDK3vp/background_login.png)';

/** Trang chủ tự chuyển tới màn đầu tiên tài khoản được xem */
const DEFAULT_PATH = '/';

export function Login() {
  const { login, loginAs } = useAuth();
  const { account: session } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? DEFAULT_PATH;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const clipPath = useMemo(() => buildTornEdgeClipPath(), []);

  if (session) return <Navigate to={from} replace />;

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsPending(true);
    try {
      await login(username, password, remember);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập không thành công, thử lại.');
      setIsPending(false);
    }
  };

  return (
    <main
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#2a0306] bg-cover bg-center p-3 sm:p-6 lg:p-10"
      style={{ backgroundImage: BACKGROUND }}>
      
      <div className="absolute inset-0 bg-[#2a0306]/65 backdrop-blur-sm" aria-hidden />

      <div
        className="login-reference-enter relative h-full max-h-[830px] w-full max-w-[1540px] overflow-hidden rounded-md bg-[#2a0306] bg-cover bg-center shadow-[0_36px_100px_-12px_rgba(0,0,0,0.7),0_10px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{ backgroundImage: BACKGROUND }}>
        
        <section className="relative z-10 h-full w-full lg:absolute lg:inset-y-0 lg:left-0 lg:w-[47%] lg:drop-shadow-[6px_0_10px_rgba(0,0,0,0.35)]">
          <div
            className="flex h-full overflow-y-auto bg-white px-6 py-[clamp(16px,4vh,40px)] sm:px-12 lg:px-[5.5%] lg:[clip-path:var(--login-torn)]"
            style={{ '--login-torn': clipPath } as React.CSSProperties}>
            
            <div className="my-auto w-full max-w-[480px] lg:w-[68%]">
              <img src={LOGO} alt="Công an hiệu" className="mb-[clamp(10px,2.5vh,24px)] h-[clamp(40px,8vh,64px)] w-auto lg:hidden" />

              <form onSubmit={handleSignIn} className="w-full" noValidate>
                <header>
                  <h1 className="text-[clamp(26px,4.8vh,44px)] font-extrabold leading-tight tracking-tight text-[#a30d18]">ĐĂNG NHẬP</h1>
                  <p className="mt-[clamp(4px,1vh,10px)] text-[clamp(16px,2.9vh,24px)] font-semibold leading-snug text-gray-800">
                    Hệ thống quản lý <span className="font-extrabold text-[#a30d18]">KPI</span>
                  </p>
                  <div className="mt-[clamp(10px,2vh,20px)] h-[3px] w-[72px] rounded-full bg-[#a30d18]" />
                </header>

                <div className="mt-[clamp(16px,4vh,40px)] space-y-[clamp(10px,2vh,20px)]">
                  <div className="relative">
                    <label htmlFor="username" className="sr-only">
                      Tài khoản
                    </label>
                    <UserIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      autoFocus
                      required
                      placeholder="Tài khoản"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      aria-invalid={Boolean(error) && !username.trim()}
                      className="h-[clamp(42px,6.2vh,56px)] w-full rounded-xl border border-gray-200 bg-gray-50 pl-14 pr-4 text-[15px] text-gray-900 outline-none focus:border-[#a30d18] focus:bg-white focus:ring-4 focus:ring-[#a30d18]/10"
                      style={{ transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out' }} />
                    
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="sr-only">
                      Mật khẩu
                    </label>
                    <LockIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={Boolean(error) && !password}
                      className="h-[clamp(42px,6.2vh,56px)] w-full rounded-xl border border-gray-200 bg-gray-50 pl-14 pr-14 text-[15px] text-gray-900 outline-none focus:border-[#a30d18] focus:bg-white focus:ring-4 focus:ring-[#a30d18]/10"
                      style={{ transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out' }} />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a30d18]/40">
                      
                      {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error &&
                <p role="alert" className="mt-3 text-sm font-medium text-[#a30d18]">
                    {error}
                  </p>
                }

                <label className="mt-[clamp(10px,2vh,20px)] inline-flex cursor-pointer select-none items-center gap-3 text-sm text-gray-700">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
                  <span className="flex h-5 w-5 items-center justify-center rounded-[5px] border border-gray-300 bg-white peer-checked:border-[#a30d18] peer-checked:bg-[#a30d18] peer-focus-visible:ring-2 peer-focus-visible:ring-[#a30d18]/40">
                    {remember && <CheckIcon className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </span>
                  Ghi nhớ đăng nhập
                </label>

                <button
                  type="submit"
                  disabled={isPending}
                  className="relative mt-[clamp(12px,2.4vh,24px)] flex h-[clamp(42px,6.2vh,56px)] w-full items-center justify-center rounded-xl bg-[#7f0b13] text-[15px] font-bold tracking-wide text-white shadow-[0_8px_20px_-6px_rgba(142,14,21,0.6)] hover:bg-[#a30d18] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a30d18]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
                  style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
                  
                  {isPending ?
                  <span className="flex items-center gap-2">
                      <Loader2Icon className="h-5 w-5 animate-spin" />
                      ĐANG XỬ LÝ...
                    </span> :

                  <>
                      ĐĂNG NHẬP
                      <ArrowRightIcon className="absolute right-6 h-5 w-5" />
                    </>
                  }
                </button>

                <div className="my-[clamp(12px,2.8vh,28px)] flex items-center gap-4">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-sm text-gray-500">Hoặc đăng nhập bằng</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                  type="button"
                  className="flex h-[clamp(42px,6.2vh,56px)] w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-[15px] font-medium text-gray-900 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-200"
                  style={{ transition: 'background-color 150ms ease-out, border-color 150ms ease-out' }}>
                  
                  <KeyRoundIcon className="h-5 w-5 text-gray-700" />
                  Tài khoản nội bộ (SSO)
                </button>
              </form>

              <DemoAccounts
                onPick={async (name) => {
                  try {
                    await loginAs(name);
                    navigate(from, { replace: true });
                  } catch (err) {
                    setUsername(name);
                    setError(err instanceof Error ? err.message : 'Không đăng nhập được.');
                  }
                }} />
              
            </div>
          </div>
        </section>

        <section className="pointer-events-none absolute inset-y-0 right-0 hidden w-[60%] items-center justify-center lg:flex">
          <div className="login-brand-enter flex flex-col items-center text-center">
            <img src={LOGO} alt="Công an hiệu" className="h-[clamp(140px,34vh,290px)] w-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]" />
            <h2 className="login-gold-metal mt-[clamp(12px,3.5vh,32px)] font-serif text-[clamp(34px,7vh,64px)] font-semibold leading-tight tracking-[0.02em]">
              BỘ CÔNG AN
            </h2>
            <div className="mt-[clamp(6px,1.4vh,14px)] flex items-center gap-4">
              <span className="h-px w-[clamp(48px,7vw,110px)] bg-[#E9C46A]/80" />
              <p className="whitespace-nowrap text-[clamp(12px,1.9vh,17px)] font-normal tracking-[0.35em] text-[#F3D58A]">VÌ AN NINH TỔ QUỐC</p>
              <span className="h-px w-[clamp(48px,7vw,110px)] bg-[#E9C46A]/80" />
            </div>
          </div>
        </section>
      </div>
    </main>);

}