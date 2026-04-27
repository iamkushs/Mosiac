export interface QueryParseResult {
  cleanQuery: string
  filters: {
    visual_mode?: string
    screen_pattern?: string
    industry_vertical?: string
    has_data_viz?: boolean
    has_ai_elements?: boolean
    density?: string
    platform?: string
    layout_pattern?: string
  }
}

interface Rule {
  patterns: RegExp[]
  key: keyof QueryParseResult['filters']
  value: string | boolean
  removeFromQuery: boolean
}

const RULES: Rule[] = [
  // VISUAL MODE — remove: purely structural, no semantic value alone
  { patterns: [/\bdark\s+mode\b/g, /\bdark\s+theme\b/g, /\bdark\s+ui\b/g], key: 'visual_mode', value: 'dark', removeFromQuery: true },
  { patterns: [/\bdark\b/g], key: 'visual_mode', value: 'dark', removeFromQuery: true },
  { patterns: [/\blight\s+mode\b/g, /\blight\s+theme\b/g, /\blight\s+ui\b/g], key: 'visual_mode', value: 'light', removeFromQuery: true },

  // SCREEN PATTERN — keep in query for semantic value
  { patterns: [/\bdashboard\b/g], key: 'screen_pattern', value: 'dashboard', removeFromQuery: false },
  { patterns: [/\bonboarding\b/g, /\bonboard\b/g], key: 'screen_pattern', value: 'onboarding', removeFromQuery: false },
  { patterns: [/\blogin\b/g, /\bsign\s+in\b/g, /\bsignin\b/g], key: 'screen_pattern', value: 'login', removeFromQuery: false },
  { patterns: [/\bsignup\b/g, /\bsign\s+up\b/g, /\bregister\b/g], key: 'screen_pattern', value: 'signup', removeFromQuery: false },
  { patterns: [/\bsettings\b/g, /\bconfiguration\b/g], key: 'screen_pattern', value: 'settings', removeFromQuery: false },
  { patterns: [/\bpricing\s+page\b/g, /\bpricing\b/g], key: 'screen_pattern', value: 'pricing', removeFromQuery: false },
  { patterns: [/\bempty\s+state\b/g, /\bzero\s+state\b/g], key: 'screen_pattern', value: 'empty-state', removeFromQuery: false },
  { patterns: [/\bcheckout\b/g], key: 'screen_pattern', value: 'checkout', removeFromQuery: false },
  { patterns: [/\buser\s+management\b/g, /\bteam\s+management\b/g], key: 'screen_pattern', value: 'user-management', removeFromQuery: false },
  { patterns: [/\breporting\b/g, /\breports\b/g], key: 'screen_pattern', value: 'reporting', removeFromQuery: false },
  { patterns: [/\bapproval\s+workflow\b/g, /\bapproval\b/g], key: 'screen_pattern', value: 'approval-workflow', removeFromQuery: false },

  // INDUSTRY VERTICAL — keep in query
  { patterns: [/\bfintech\b/g, /\bfinance\b/g, /\bfinancial\b/g, /\bbanking\b/g], key: 'industry_vertical', value: 'fintech', removeFromQuery: false },
  { patterns: [/\bhr\b/g, /\bhuman\s+resources\b/g, /\bemployee\b/g, /\bworkforce\b/g], key: 'industry_vertical', value: 'hr', removeFromQuery: false },
  { patterns: [/\bmarketing\b/g, /\bcampaign\b/g, /\bads\b/g, /\badvertising\b/g], key: 'industry_vertical', value: 'marketing', removeFromQuery: false },
  { patterns: [/\bdata\s+analytics\b/g, /\banalytics\b/g], key: 'industry_vertical', value: 'analytics', removeFromQuery: false },
  { patterns: [/\bdevtools\b/g, /\bdeveloper\s+tools\b/g, /\bdev\s+tool\b/g], key: 'industry_vertical', value: 'devtools', removeFromQuery: false },
  { patterns: [/\bhealthcare\b/g, /\bmedical\b/g, /\bhealth\b/g], key: 'industry_vertical', value: 'healthcare', removeFromQuery: false },
  { patterns: [/\bproject\s+management\b/g, /\btask\s+management\b/g], key: 'industry_vertical', value: 'project-management', removeFromQuery: false },
  { patterns: [/\bcrm\b/g, /\bsales\b/g, /\bdeals\b/g, /\bpipeline\b/g], key: 'industry_vertical', value: 'crm', removeFromQuery: false },
  { patterns: [/\becommerce\b/g, /\be-commerce\b/g, /\bshop\b/g, /\bstore\b/g], key: 'industry_vertical', value: 'ecommerce', removeFromQuery: false },

  // DATA VIZ — remove qualifiers, keep core content terms
  // Most specific phrases first so orphaned prepositions aren't left behind
  { patterns: [/\bwith\s+data\s+visualization\b/g, /\bwith\s+data\s+viz\b/g, /\bwith\s+(?:charts|graphs|visualization)\b/g, /\bdata\s+visualization\b/g, /\bdata\s+viz\b/g], key: 'has_data_viz', value: true, removeFromQuery: true },
  { patterns: [/\bcharts\b/g, /\bgraphs\b/g], key: 'has_data_viz', value: true, removeFromQuery: false },

  // AI ELEMENTS — remove standalone qualifiers
  { patterns: [/\bartificial\s+intelligence\b/g, /\bchatbot\b/g, /\bconversational\b/g], key: 'has_ai_elements', value: true, removeFromQuery: true },
  { patterns: [/\bllm\b/g], key: 'has_ai_elements', value: true, removeFromQuery: true },
  { patterns: [/\bchat\b/g, /\bai\b/g], key: 'has_ai_elements', value: true, removeFromQuery: false },

  // DENSITY — remove: purely structural
  { patterns: [/\bdata\s+heavy\b/g, /\binformation\s+dense\b/g, /\bdense\b/g], key: 'density', value: 'dense', removeFromQuery: true },
  { patterns: [/\bminimal\b/g, /\bclean\b/g, /\bsparse\b/g, /\bsimple\b/g], key: 'density', value: 'sparse', removeFromQuery: true },

  // PLATFORM — remove: purely structural
  { patterns: [/\bmobile\b/g, /\bios\b/g, /\bandroid\b/g, /\bphone\b/g], key: 'platform', value: 'mobile', removeFromQuery: true },
  { patterns: [/\btablet\b/g, /\bipad\b/g], key: 'platform', value: 'tablet', removeFromQuery: true },
  { patterns: [/\bweb\b/g, /\bdesktop\b/g, /\bbrowser\b/g], key: 'platform', value: 'web', removeFromQuery: true },
]

export function parseQuery(query: string): QueryParseResult {
  const filters: QueryParseResult['filters'] = {}
  const lower = query.toLowerCase()
  let working = lower

  for (const rule of RULES) {
    // Only process this rule if the filter key hasn't been set yet
    // (first-match wins — more specific multi-word patterns are listed first)
    if (rule.key in filters) continue

    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0
      if (pattern.test(working)) {
        // Type-safe assignment
        if (rule.key === 'has_data_viz' || rule.key === 'has_ai_elements') {
          (filters as Record<string, string | boolean>)[rule.key] = rule.value as boolean
        } else {
          (filters as Record<string, string | boolean>)[rule.key] = rule.value as string
        }

        if (rule.removeFromQuery) {
          pattern.lastIndex = 0
          working = working.replace(pattern, ' ')
        }
        break
      }
    }
  }

  // Clean up extra whitespace
  const cleanQuery = working.replace(/\s{2,}/g, ' ').trim() || query

  return { cleanQuery, filters }
}
