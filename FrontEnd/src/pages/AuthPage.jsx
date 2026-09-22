import { useState } from "react";
import { IntegrationNotice } from "../components/IntegrationNotice";

export function AuthPage({ mode = "login" }) {
  const isRegister = mode === "cadastro";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordInvalid = password.length > 0 && password.length < 8;
  const emailDescriptionId = emailInvalid ? "auth-email-error" : undefined;
  const passwordDescriptionId = passwordInvalid
    ? "auth-password-error password-help"
    : "password-help";

  return (
    <main id="conteudo-principal" className="grid min-h-screen place-items-center bg-page px-4 py-10 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8" aria-labelledby="auth-heading">
        <a href="#/painel" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-ink dark:text-white">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-white" aria-hidden="true">T</span>
          timetrack
        </a>
        <p className="eyebrow mt-8">GESTOR</p>
        <h1 id="auth-heading" className="font-display text-2xl font-extrabold text-ink dark:text-white">{isRegister ? "Criar conta" : "Entrar no Dashboard"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{isRegister ? "O cadastro do gestor deve ser realizado por e-mail." : "Acesso destinado ao gestor. O colaborador utiliza o Agente Desktop e não realiza login manual."}</p>

        <form className="mt-6" onSubmit={(event) => event.preventDefault()} noValidate>
          <label htmlFor="auth-email" className="block text-sm font-semibold text-ink dark:text-white">E-mail</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            className="form-field mt-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailDescriptionId}
          />
          {emailInvalid && (
            <p id="auth-email-error" className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300" role="alert">
              Informe um e-mail válido.
            </p>
          )}

          <label htmlFor="auth-password" className="mt-4 block text-sm font-semibold text-ink dark:text-white">Senha</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="form-field mt-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={passwordInvalid || undefined}
            aria-describedby={passwordDescriptionId}
          />
          {passwordInvalid && (
            <p id="auth-password-error" className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300" role="alert">
              A senha deve ter pelo menos 8 caracteres.
            </p>
          )}
          <p id="password-help" className="mt-1 text-xs text-muted">Validação frontend mínima: 8 caracteres. A política definitiva de senha deve ser definida pelo backend.</p>

          <button type="submit" className="primary-button mt-5 w-full" disabled>{isRegister ? "Criar conta" : "Entrar"}</button>
        </form>

        <div className="mt-5"><IntegrationNotice title="Autenticação ainda não conectada">RF-02 exige cadastro, login e sessão autenticada. Os campos e validações estão prontos, mas o envio fica desabilitado até existir contrato oficial de autenticação.</IntegrationNotice></div>

        <p className="mt-5 text-center text-sm text-muted">
          {isRegister ? "Já possui conta? " : "Ainda não possui conta? "}
          <a className="font-bold text-brand hover:underline" href={isRegister ? "#/login" : "#/cadastro"}>{isRegister ? "Entrar" : "Criar conta"}</a>
        </p>
      </section>
    </main>
  );
}
