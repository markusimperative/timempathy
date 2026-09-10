import { useId } from 'react'
import { motion } from 'motion/react'
import type { MomentKind } from '../content/moments'

// The same small drawing lives inside the scene and beside tomorrow's words.
function ObjectDrawing({ kind }: { kind: MomentKind }) {
  return (
    <>
      {kind === 'cup' && (
        <>
          <ellipse cx="47" cy="79" rx="35" ry="5" fill="#b49c7626" stroke="none" />
          <path d="M23 43H39L42 47L45 43H72L69 65Q65 78 48 77Q30 77 26 65Z" fill="#efe1c5" />
          <path d="M72 47C97 43 92 70 69 68M25 51Q46 58 70 51" />
          <path d="M40 33C29 22 49 20 40 9M55 34C47 24 66 21 57 12" className="object-steam" />
          <path d="M30 59L32 66M36 62L37 69" opacity=".45" />
        </>
      )}
      {kind === 'rain' && (
        <>
          <path d="M19 13H80V82H19ZM48 14V82M20 48H80" fill="#e1e8dd" />
          <path d="M48 17L70 25V73L48 80Z" fill="#f3ecd9" />
          <path d="M33 26L29 36M71 30L67 38M31 57L26 69M13 85H85" />
        </>
      )}
      {kind === 'table' && (
        <>
          <path d="M13 39V67H27M87 39V67H74M17 67V83M83 67V83" />
          <ellipse cx="50" cy="54" rx="34" ry="11" fill="#e6bba0" />
          <path d="M25 61L21 87M76 61L80 87M49 45V24H54V45" />
          <ellipse cx="34" cy="53" rx="9" ry="3" />
          <ellipse cx="68" cy="53" rx="9" ry="3" />
          <path d="M51 23Q44 17 51 10Q58 17 51 23Z" fill="#c17a4f" stroke="none" />
        </>
      )}
      {kind === 'moon' && (
        <>
          <path
            d="M63 12C26 5 19 56 47 64C69 72 86 49 76 31C74 55 42 52 43 30Q44 16 63 12Z"
            fill="#ead7ac"
          />
          <path d="M13 83Q48 64 86 85M23 18V27M19 22H27M76 14V20M73 17H79" />
          <path d="M55 79Q39 84 46 93" />
        </>
      )}
      {kind === 'flower' && (
        <>
          <path d="M33 69H70L65 90H38Z" fill="#d6ac8a" />
          <path d="M51 69V28M51 53C27 61 15 35 22 30C44 28 54 42 51 53Z" fill="#b5c2a0" />
          <path d="M51 43C50 20 72 11 82 17C84 39 65 50 51 43Z" fill="#d3d9b7" />
          <path d="M52 43L73 24M49 50L28 36M50 30Q38 20 44 12" />
        </>
      )}
    </>
  )
}

export function MemoryObject({ kind }: { kind: MomentKind }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={`memory-object object-${kind}`}
    >
      <ObjectDrawing kind={kind} />
    </svg>
  )
}

export function MemoryScene({
  kind,
  day,
  active,
  still,
}: {
  kind: MomentKind
  day: number
  active: boolean
  still: boolean
}) {
  const id = useId()
  const transition = { duration: still ? 0 : 0.9, ease: [0.22, 0.7, 0.2, 1] as const }
  return (
    <svg
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 220 260"
      fill="none"
      aria-hidden="true"
      className={`memory-scene scene-${kind}`}
    >
      <defs>
        <pattern id={`${id}-grain`} width="13" height="17" patternUnits="userSpaceOnUse">
          <path d="M2 3L3 2M9 12H11M5 16H6" stroke="#5a5b3c" strokeOpacity=".11" strokeWidth=".7" />
        </pattern>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#edd5a0" stopOpacity=".8" />
          <stop offset="1" stopColor="#edd5a0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        width="220"
        height="260"
        fill={kind === 'moon' ? '#344f47' : kind === 'rain' ? '#dce2d6' : '#eee5cf'}
      />
      <rect y="179" width="220" height="81" fill={kind === 'moon' ? '#627969' : '#d6ceb5'} />
      <path d="M0 179H220" stroke={kind === 'moon' ? '#a4b29b' : '#8c927b'} strokeWidth=".8" />
      {kind === 'cup' && (
        <>
          <path d="M15 14H97V128H15Z" fill="#d4dec9" stroke="#79866b" />
          <circle cx={day === 1 ? 72 : 41} cy={day === 2 ? 61 : 43} r="22" fill="#e8c18a" />
          <path d="M18 99Q57 76 96 97V126H18Z" fill="#b1c1a3" />
          <path d="M55 15V129M15 71H98M8 132H106" stroke="#6a7860" />
          <motion.path
            d="M17 133H99L205 238H37Z"
            fill={`url(#${id}-light)`}
            animate={{ opacity: active ? 1 : 0.45 }}
            transition={transition}
          />
          <path d="M133 63H208M141 66V78M198 66V78" stroke="#6c7660" />
          <path
            d="M159 62V43H179V62M169 43V28M167 35Q150 38 153 26Q166 26 167 35M169 29Q183 29 183 16Q169 18 169 29"
            fill="#b0bfa0"
            stroke="#64775d"
          />
          <ellipse cx="116" cy="217" rx="94" ry="23" fill="#c1a883" />
          <path d="M23 217Q115 251 211 217M44 232L39 260M191 233L197 260" stroke="#80694d" />
          <g transform="translate(64 139) scale(.98)" stroke="#725b41" strokeWidth="1.25">
            <ObjectDrawing kind="cup" />
          </g>
          {day === 2 && (
            <motion.g
              animate={{ opacity: active ? 1 : 0.35, x: active ? 0 : 8 }}
              transition={transition}
            >
              <path
                d="M160 169H191L188 185Q175 195 163 184ZM191 172Q207 170 201 182H189"
                fill="#d3dcc8"
                stroke="#66745c"
              />
            </motion.g>
          )}
          <path d="M22 238L50 245M178 244L205 237M77 254H94" stroke="#856e4d" opacity=".4" />
        </>
      )}
      {kind === 'rain' && (
        <>
          <path d="M38 20H186V164H38Z" fill="#bccfc5" stroke="#5b776c" />
          <path d="M39 135Q80 109 114 130T184 121V164H39Z" fill="#91aa94" />
          <path d="M112 21V163M38 85H186M27 169H195" stroke="#65786a" strokeWidth="2" />
          <motion.g animate={{ x: active ? -9 : 0 }} transition={transition}>
            <path d="M25 16H66Q46 78 71 167L27 175Q36 98 25 16Z" fill="#f2eddd" stroke="#a3aa96" />
            <path d="M39 26Q49 75 39 138M50 20Q38 80 58 155" stroke="#c2c7b6" />
          </motion.g>
          <motion.path
            initial={false}
            d={active ? 'M113 27L165 49V145L113 162Z' : 'M113 27L178 29V161L113 162Z'}
            fill="#dbe7d966"
            stroke="#4c6e61"
            transition={transition}
            animate={{ d: active ? 'M113 27L165 49V145L113 162Z' : 'M113 27L178 29V161L113 162Z' }}
          />
          <g stroke="#5c7c72" strokeWidth="1.3">
            <path d="M86 38L79 55M157 38L150 53M95 95L89 109M174 94L167 111M82 131L78 141" />
          </g>
          <path d="M33 228H204M151 222V206H185L181 225H155Z" stroke="#70836a" fill="#c3cea9" />
          <path
            d="M166 206V189M166 199Q146 199 149 188Q163 185 166 199M167 193Q178 177 186 187Q180 199 167 193"
            stroke="#63775c"
            fill="#a8ba98"
          />
        </>
      )}
      {kind === 'table' && (
        <>
          <path d="M75 20H151V105H75Z" fill="#d5aa82" />
          <path d="M84 94Q103 62 116 87T144 60V99H84Z" fill="#a9b093" />
          <motion.g animate={{ x: active ? 9 : 0, rotate: active ? 2 : 0 }} transition={transition}>
            <path
              d="M19 138V212H54M24 146H49V179H24M25 212L19 257M47 213L55 257"
              stroke="#68745d"
              strokeWidth="3"
            />
          </motion.g>
          <path
            d="M202 138V212H166M172 146H196V179H172M195 212L203 257M174 213L165 257"
            stroke="#68745d"
            strokeWidth="3"
          />
          <ellipse cx="112" cy="186" rx="78" ry="27" fill="#dbb191" stroke="#9a7153" />
          <path d="M48 200L42 260M177 200L187 260" stroke="#937052" strokeWidth="3" />
          <path d="M78 163L145 168L157 208L87 211Z" fill="#ebe0ca" />
          <ellipse cx="67" cy="186" rx="21" ry="8" stroke="#94785c" />
          <ellipse cx="158" cy="186" rx="21" ry="8" stroke="#94785c" />
          <path d="M109 181V140H117V181M105 184H123" fill="#e9d2a8" stroke="#94785c" />
          <motion.path
            d="M113 137Q102 128 113 116Q123 130 113 137Z"
            fill="#b36c39"
            animate={{ scaleY: active ? 1.15 : 1 }}
            transition={transition}
          />
        </>
      )}
      {kind === 'moon' && (
        <>
          <path
            d="M140 28C100 15 88 76 125 86C154 93 173 62 158 44C160 76 117 74 119 47Q120 32 140 28Z"
            fill="#e6d8ae"
          />
          <path d="M0 153Q64 111 125 154T220 140V218H0Z" fill="#748971" />
          <path d="M0 191Q76 151 140 189T220 179V260H0Z" fill="#526f5d" />
          <path d="M160 162Q89 179 127 199T93 260H36Q139 218 92 200T160 162Z" fill="#bbb99a" />
          <path
            d="M15 260L34 202M23 237L12 220M27 228L44 215M197 260L186 214M192 241L206 226"
            stroke="#b3c0a0"
          />
          <motion.g
            animate={{ opacity: active ? 1 : 0.35 }}
            transition={transition}
            stroke="#ede5c9"
          >
            <path d="M52 43V55M46 49H58M183 95V103M179 99H187M82 95V101M79 98H85" />
          </motion.g>
          <path d="M84 231L88 228M91 216L95 214" stroke="#727b61" strokeWidth="2" />
        </>
      )}
      {kind === 'flower' && (
        <>
          <path d="M137 0V163H220" stroke="#8b9a7b" />
          <path d="M148 0V152H220M138 74H220" stroke="#b1bca0" />
          <path d="M144 154H220L203 231L52 228Z" fill={`url(#${id}-light)`} />
          <ellipse cx="100" cy="231" rx="68" ry="11" fill="#b1aa8a" />
          <path d="M64 170H137L127 223Q102 233 75 223Z" fill="#c89b77" stroke="#8c7555" />
          <ellipse cx="100" cy="171" rx="36" ry="8" fill="#8f8463" />
          <path d="M102 174V72" stroke="#5b7655" strokeWidth="2" />
          <path d="M102 146Q40 157 35 106Q91 91 102 146Z" fill="#8ea47b" stroke="#647f58" />
          <path d="M99 139L46 112" stroke="#d5d9b1" />
          <motion.g
            style={{ originX: '102px', originY: '105px' }}
            animate={{ rotate: active ? -13 : 4 }}
            transition={transition}
          >
            <path d="M102 107Q100 46 165 48Q184 101 102 107Z" fill="#b0bd86" stroke="#708858" />
            <path d="M103 106L156 57" stroke="#e8e8c6" />
          </motion.g>
          <path d="M102 80Q71 75 75 45Q103 39 102 80Z" fill="#bdc699" stroke="#7d935f" />
          <path
            d="M80 181L85 219M92 184L95 223M108 184L107 224M123 181L118 221"
            stroke="#9b7d5c"
            opacity=".45"
          />
        </>
      )}
      <rect width="220" height="260" fill={`url(#${id}-grain)`} />
    </svg>
  )
}
