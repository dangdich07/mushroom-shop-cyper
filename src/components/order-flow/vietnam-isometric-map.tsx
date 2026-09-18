interface VietnamIsometricMapProps {
  cancelled: boolean;
}

const vietnamShape = "M176 27 C157 29 144 40 137 54 L117 61 L129 78 L122 93 L143 102 L157 116 L164 135 L158 154 L145 172 L151 194 L166 214 L171 235 L165 257 L157 279 L160 301 L172 321 L180 343 L177 365 L166 385 L158 406 L166 427 L185 446 L207 462 L232 452 L252 435 L247 417 L226 407 L215 389 L212 369 L219 348 L224 327 L219 307 L207 286 L201 265 L205 243 L216 222 L216 201 L205 181 L193 163 L190 143 L198 125 L214 109 L226 92 L219 75 L226 57 L207 51 L195 35 Z";

const extrusionLayers = Array.from({ length: 9 }, (_, index) => 9 - index);

export function VietnamIsometricMap({ cancelled }: VietnamIsometricMapProps) {
  const destinationColor = cancelled ? "#ff4d67" : "#00ff66";

  return (
    <svg
      viewBox="0 0 360 500"
      className="h-full w-full overflow-visible drop-shadow-[0_22px_26px_rgba(0,245,255,0.18)]"
      focusable="false"
    >
      <defs>
        <linearGradient id="vn-top-surface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17374a" />
          <stop offset="0.48" stopColor="#0c2739" />
          <stop offset="1" stopColor="#061522" />
        </linearGradient>
        <linearGradient id="vn-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#007f91" />
          <stop offset="1" stopColor="#022331" />
        </linearGradient>
        <linearGradient id="vn-route" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#00f5ff" />
          <stop offset="1" stopColor={destinationColor} />
        </linearGradient>
        <radialGradient id="vn-relief" cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor="#5ee8ff" stopOpacity="0.24" />
          <stop offset="0.55" stopColor="#00b8cc" stopOpacity="0.08" />
          <stop offset="1" stopColor="#00121d" stopOpacity="0" />
        </radialGradient>
        <filter id="vn-route-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="vn-point-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="vn-land-clip"><path d={vietnamShape} /></clipPath>
      </defs>

      <ellipse cx="193" cy="458" rx="112" ry="24" fill="#00f5ff" opacity="0.05" />

      <g transform="translate(-2 -5) rotate(-4 185 250)">
        {extrusionLayers.map((depth) => (
          <path
            key={depth}
            d={vietnamShape}
            transform={`translate(${depth * 1.8} ${depth * 2.7})`}
            fill="url(#vn-edge)"
            stroke="#00b8cc"
            strokeOpacity={0.08 + depth * 0.018}
            strokeWidth="1"
          />
        ))}

        <path d={vietnamShape} fill="url(#vn-top-surface)" stroke="#00f5ff" strokeWidth="2.4" />
        <path d={vietnamShape} fill="url(#vn-relief)" />

        <g clipPath="url(#vn-land-clip)" fill="none" stroke="#79eaff" strokeOpacity="0.13" strokeWidth="1">
          <path d="M105 89 C153 75 191 79 238 94" />
          <path d="M127 124 C159 116 190 120 221 132" />
          <path d="M137 170 C168 160 192 167 218 183" />
          <path d="M144 219 C174 210 198 216 221 230" />
          <path d="M148 270 C178 260 202 267 224 282" />
          <path d="M154 320 C179 312 205 319 226 334" />
          <path d="M151 373 C181 363 216 374 235 392" />
          <path d="M148 420 C179 406 225 416 256 438" />
          <path d="M151 51 C169 76 172 105 163 135 C154 169 161 197 179 224 C195 248 194 276 184 303 C173 334 181 365 201 389 C217 408 225 430 224 454" />
        </g>

        <path
          d="M219 409 C203 382 198 350 204 316 C211 279 201 248 191 217 C181 186 183 157 196 129 C205 109 205 90 196 75"
          fill="none"
          stroke="#001a25"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M219 409 C203 382 198 350 204 316 C211 279 201 248 191 217 C181 186 183 157 196 129 C205 109 205 90 196 75"
          fill="none"
          stroke="url(#vn-route)"
          strokeWidth="3.5"
          strokeDasharray="8 8"
          strokeLinecap="round"
          filter="url(#vn-route-glow)"
          opacity={cancelled ? 0.25 : 0.95}
        />

        <g filter="url(#vn-point-glow)">
          <circle cx="219" cy="409" r="11" fill="#07111f" stroke="#00f5ff" strokeWidth="3" />
          <circle cx="219" cy="409" r="3" fill="#00f5ff" />
          <circle cx="196" cy="75" r="11" fill="#07111f" stroke={destinationColor} strokeWidth="3" />
          <circle cx="196" cy="75" r="3" fill={destinationColor} />
        </g>

        <g fill="#00f5ff" opacity="0.42">
          <circle cx="292" cy="198" r="3" />
          <circle cx="308" cy="226" r="2" />
          <circle cx="298" cy="256" r="2.5" />
          <circle cx="315" cy="285" r="2" />
          <circle cx="284" cy="317" r="2.5" />
          <circle cx="304" cy="347" r="2" />
        </g>
      </g>
    </svg>
  );
}
