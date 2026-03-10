$f = "components\Transactions.tsx"
$content = Get-Content $f -Raw -Encoding UTF8

# Fix broken emoji spans in type picker — replace with colored circle divs
$content = $content -replace '<span className="text-3xl">ðŸ''¸</span>', '<span className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-xl shrink-0">-</span>'
$content = $content -replace '<span className="text-3xl">ðŸ''°</span>', '<span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-xl shrink-0">+</span>'

# Fix broken arrows in Back/Next/Done buttons
$content = $content -replace "'â† Back'", "'Back'"
$content = $content -replace ">Next â†'<", ">Next<"
$content = $content -replace "'âœ" Save'", "'Save'"
$content = $content -replace "'âœ" Done'", "'Done'"

# Fix broken warning emoji in over-budget badge
$content = $content -replace 'â š¼ï¸\s*\$\{', '`Over by ${'
$content = $content -replace "``â š¼ï¸ \$\{currencySymbol\}\$\{\(parseFloat\(newAmount \|\| '0'\) - cat\.available\)\.toFixed\(2\)\} over``", "``Over by \${currencySymbol}\${(parseFloat(newAmount || '0') - cat.available).toFixed(2)}``"

# Fix the Regret Ghost emoji corruption if any
$content = $content -replace 'â"€â"€', '--'

[System.IO.File]::WriteAllText((Resolve-Path $f).Path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"
