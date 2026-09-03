/**
 * A marca é decorativa: o nome já está no <h1> ao lado, então o leitor de tela
 * não deve ouvir a mesma informação duas vezes.
 *
 * O panda é desenhado antes do torii de propósito. As orelhas e o topo da
 * cabeça sobem até y=58, atrás da viga inferior, e o vermelho passa por cima —
 * é o que dá a leitura de "espreitando por baixo do portal" em vez de "colado
 * embaixo dele".
 */
function MarcaDojoPanda({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 192" className={className} aria-hidden focusable="false">
      <path fill="#FFFFFF" d="M70 58h116v62c0 38-24 70-58 70s-58-32-58-70z" />
      <g fill="#100E0D">
      <path d="M70 58h26a26 46 0 0 1-26 46z" />
      <path d="M186 58h-26a26 46 0 0 0 26 46z" />
      <ellipse cx="104" cy="142" rx="16" ry="20" transform="rotate(-18 104 142)" />
      <ellipse cx="152" cy="142" rx="16" ry="20" transform="rotate(18 152 142)" />
      <path d="M118 160c0-4 20-4 20 0 0 8-6 14-10 14s-10-6-10-14z" />
      </g>
   <circle cx="106" cy="137" r="3.2" fill="#FFFFFF" />
      <circle cx="150" cy="137" r="3.2" fill="#FFFFFF" />
      <path
        d="M119 177c3 7 7 8 9 3 2 5 6 4 9-3"
        fill="none"
        stroke="#100E0D"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#D01B2E">
        <path d="M42 26h32l-5 166H37z" />
        <path d="M214 26h-32l5 166h32z" />
        <rect x="22" y="50" width="212" height="20" />
        <path d="M0 2c40 6 84 10 128 10s88-4 128-10v22c-40 6-84 10-128 10S40 30 0 24z" />
      </g>
    </svg>
  );
}

export function Cabecalho() {
  return (
    <header className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center border-b-2 border-tinta pb-3">
      <h1 className="font-display text-lg font-bold tracking-tight">
        DOJO PANDA <span className="text-vermelho">・</span> 3D
      </h1>

      <MarcaDojoPanda className="h-9 w-auto justify-self-center" />

      <span className="justify-self-end rounded-campo bg-vermelho px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-papel">
        Calculadora
      </span>
    </header>
  );
}
