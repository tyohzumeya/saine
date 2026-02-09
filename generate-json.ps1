Set-Location -Path $PSScriptRoot

function Update-AudioJson {
    param(
        [string]$FolderPath,       # 音声フォルダ
        [string]$JsonPath          # 出力 JSON
    )

    # フォルダ存在確認
    if (!(Test-Path $FolderPath)) {
        Write-Host "フォルダが見つかりません: $FolderPath"
        return
    }

    # WAVファイル取得（Trim + 文字列化）
    $files = Get-ChildItem $FolderPath -Filter *.wav | ForEach-Object { $_.Name.Trim() }
    if ($files.Count -eq 0) {
        Write-Host "フォルダに WAV ファイルがありません: $FolderPath"
        return
    }

    # 既存 JSON 読み込み
    $existing = @{}
    $orderedList = @()
    if (Test-Path $JsonPath) {
        try {
            $existingJson = Get-Content $JsonPath -Raw | ConvertFrom-Json
            foreach ($item in $existingJson) {
                $fileName = $item.file.Trim()
                $orderedList += $fileName
                $existing[$fileName] = $item.label
            }
        } catch {
            Write-Host "既存 JSON が壊れているか無効です。新規作成します: $JsonPath"
        }
    }

    # 既存順序保持で JSON 配列作成
    $jsonArray = @()
    foreach ($fileName in $orderedList) {
        if ($files -contains $fileName) {
            $jsonArray += @{
                file  = $fileName
                label = $existing[$fileName]
            }
        }
    }

    # 新規ファイルを末尾に追加（アルファベット順、小文字比較で重複防止）
    $orderedLower = $orderedList | ForEach-Object { $_.ToLower() }
    $newFiles = $files | Where-Object { -not ($orderedLower -contains $_.ToLower()) } | Sort-Object
    foreach ($fileName in $newFiles) {
        $jsonArray += @{
            file  = $fileName
            label = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
        }
    }

    # JSON書き出し（1行1オブジェクト形式）
    $lines = $jsonArray | ForEach-Object { $_ | ConvertTo-Json -Compress }
    $all = "[`n" + ($lines -join ",`n") + "`n]"
    [System.IO.File]::WriteAllText($JsonPath, $all, [System.Text.Encoding]::UTF8)

    Write-Host "JSON生成完了: $JsonPath"
}

# -------------------------------
# audio と exaudio 両方更新
# -------------------------------
Update-AudioJson -FolderPath ".\audio" -JsonPath (Join-Path $PSScriptRoot "audio-list.json")
Update-AudioJson -FolderPath ".\exaudio" -JsonPath (Join-Path $PSScriptRoot "exaudio-list.json")
