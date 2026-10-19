$ErrorActionPreference = 'Stop'
$root = 'C:\Users\MOH\Documents\GG\fahad\fahad'

$edits = @(
    @{ p = 'components\Chat.tsx';              r = @(@('chatService.connect(''xtroet'')', "chatService.connect('fahad')")) },
    @{ p = 'components\StatsSection.tsx';      r = @(@("const channelSlug = 'xtroet';", "const channelSlug = 'fahad';")) },
    @{ p = 'api\leaderboard.ts';              r = @(@("|| 'xtroet'", "|| 'fahad'"), @('(xtroet)', '(fahad)')) },
    @{ p = 'api\kick-callback.ts';            r = @(@("      'xtroet'", "      'fahad'")) },
    @{ p = 'index.tsx';                        r = @(@("'xtroet-boot'", "'fahad-boot'")) },
    @{ p = 'metadata.json';                    r = @(@('FAHAD (Nasser Alanazi)', 'FAHAD'), @('The official Stream Hub for FAHAD', 'The official Hub for FAHAD')) },
    @{ p = 'components\LatestYoutube.tsx';     r = @(@('Nasser', 'FAHAD'), @('nasser', 'fahad')) },
    @{ p = 'components\CommunityWidgets.tsx';  r = @(@('FAHAD EMPIRE (Nasser official)', 'FAHAD EMPIRE (official)'), @('FAHAD (Nasser official)', 'FAHAD (official)'), @("'Nasser official channel'", "'FAHAD official channel'")) }
)

foreach ($e in $edits) {
    $path = Join-Path $root $e.p
    $s = Get-Content -LiteralPath $path -Raw
    foreach ($pair in $e.r) { $s = $s.Replace($pair[0], $pair[1]) }
    Set-Content -LiteralPath $path -Value $s -NoNewline
    Write-Output "patched $($e.p)"
}
