/**
 * Marca da Dojo Panda, a partir do vetor original da empresa.
 *
 * O único ajuste sobre o traçado recebido é a cor do portal, que veio preto e
 * é vermelho na marca. O vermelho é o mesmo token da interface, para o
 * cabeçalho não acabar com dois vermelhos quase iguais lado a lado.
 *
 * O viewBox é a caixa justa do desenho, medida com getBBox. O arquivo original
 * vem num quadrado de 1254 com cerca de um terço de área vazia em volta, o que
 * faria a marca aparecer bem menor que a altura pedida aqui.
 *
 * É decorativa: o nome já está no <h1> ao lado, então o leitor de tela não
 * deve ouvir a mesma informação duas vezes.
 */
function MarcaDojoPanda({ className }: { className?: string }) {
  return (
    <svg
      viewBox="219.76 253.27 817.24 607.73"
      className={className}
      aria-hidden
      focusable="false"
    >
      <g transform="translate(0,1254) scale(0.1,-0.1)" stroke="none">
        <path
          fill="#D01B2E"
          d="M2198 9998 c-5 -13 31 -111 209 -573 127 -332 116 -310 177 -339 79 -39 392 -151 471 -169 60 -14 198 -17 1010 -21 517 -3 1150 -9 1408 -13 l467 -6 0 -234 0 -233 -761 0 -760 0 7 175 7 175 -416 2 -416 3 -5 -35 c-3 -19 -8 -97 -12 -172 l-6 -138 -372 -2 -371 -3 -3 -297 -2 -298 355 0 c286 0 357 -3 361 -13 6 -17 -45 -1026 -166 -3262 -16 -308 -30 -572 -30 -587 l0 -28 448 5 447 5 7 172 c9 205 72 1866 93 2423 31 866 47 1261 51 1273 3 9 387 12 1878 12 l1875 0 5 -52 c4 -47 25 -589 56 -1518 24 -688 80 -2226 83 -2280 l2 -35 448 0 447 -1 0 61 c0 33 -5 132 -10 220 -6 88 -24 441 -40 785 -17 344 -39 803 -50 1020 -62 1215 -88 1781 -82 1793 2 4 163 7 358 7 l354 0 -2 298 -3 297 -372 3 -373 2 0 59 c0 32 -3 106 -7 164 l-6 107 -420 0 -420 0 7 -170 8 -170 -761 0 -761 0 0 233 0 234 1007 6 c553 4 1182 7 1397 7 457 0 445 -2 738 108 208 78 234 91 265 124 22 24 353 841 353 872 0 13 -5 16 -17 11 -88 -34 -666 -233 -729 -250 -45 -13 -121 -28 -170 -35 -67 -8 -875 -10 -3234 -8 -3441 4 -3153 -1 -3345 58 -54 17 -576 204 -656 235 -9 3 -18 1 -21 -7z"
        />
        <g fill="#000000">
          <path d="M4580 7621 l-55 -6 -21 -540 c-12 -297 -24 -579 -27 -627 -2 -49 -2 -88 2 -88 4 0 22 26 41 57 103 171 309 406 470 536 41 33 119 89 172 124 l97 63 -15 52 c-28 93 -85 189 -155 260 -127 127 -320 191 -509 169z" />
          <path d="M7804 7620 c-231 -35 -410 -181 -488 -398 -14 -40 -26 -75 -26 -78 0 -2 37 -29 83 -58 244 -158 444 -358 616 -615 l76 -114 3 44 c2 24 -1 159 -7 299 -6 140 -16 401 -22 580 -7 179 -15 328 -18 331 -10 11 -163 17 -217 9z" />
          <path d="M5420 6071 c-113 -37 -222 -133 -355 -312 -161 -216 -233 -421 -205 -581 37 -216 227 -377 442 -378 124 0 215 62 257 176 12 33 33 89 47 125 23 61 97 197 187 344 45 71 56 107 64 202 14 175 -62 334 -191 401 -41 20 -68 26 -136 28 -47 2 -96 0 -110 -5z m187 -408 c53 -35 69 -121 34 -179 -13 -21 -36 -38 -66 -49 -45 -18 -48 -18 -92 1 -58 24 -86 70 -80 132 10 98 121 149 204 95z" />
          <path d="M6917 6066 c-130 -48 -212 -173 -224 -341 -8 -116 16 -202 91 -325 80 -131 142 -256 191 -384 59 -153 118 -205 246 -214 199 -14 391 116 449 306 24 78 26 203 5 286 -38 145 -208 410 -352 547 -108 103 -171 133 -283 137 -54 1 -99 -3 -123 -12z m140 -387 c15 -5 40 -22 55 -36 96 -91 -10 -253 -137 -211 -106 35 -114 199 -12 243 39 17 57 18 94 4z" />
          <path d="M6070 4883 c-102 -18 -155 -53 -166 -109 -15 -82 75 -179 238 -257 l88 -42 0 -46 c0 -51 -19 -78 -80 -116 -39 -24 -147 -57 -230 -70 l-55 -9 60 -13 c85 -19 194 -9 278 24 l67 27 53 -21 c105 -42 200 -51 299 -29 l53 11 -85 18 c-94 19 -156 41 -212 76 -46 28 -58 50 -58 106 0 44 0 45 53 67 72 31 175 99 220 146 100 103 56 204 -102 234 -51 10 -369 12 -421 3z" />
        </g>
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
