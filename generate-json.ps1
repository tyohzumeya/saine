Set-Location -Path $PSScriptRoot

function Update-AudioJson {
    param(
        [string]$FolderPath,        # 音声フォルダ
        [string]$JsonPath,          # 出力 JSON
        [double]$Volume = $null,    # 任意の volume
        [double]$Gap    = $null     # 任意の gap
    )

    # フォルダ存在確認
    if (!(Test-Path $FolderPath)) {
        Write-Host "フォルダが見つかりません: $FolderPath"
        return
    }

    if ($FolderPath -ne ".\saineFace") {
        # WAVファイル取得（Trim + 文字列化）
        $files = Get-ChildItem $FolderPath -Filter *.wav | ForEach-Object { $_.Name.Trim() }
        if ($files.Count -eq 0) {
            Write-Host "フォルダに WAV ファイルがありません: $FolderPath"
            return
        }
    } else {
        # WAVファイル取得（Trim + 文字列化）
        $files = Get-ChildItem $FolderPath -Filter *.png | ForEach-Object { $_.Name.Trim() }
        if ($files.Count -eq 0) {
            Write-Host "フォルダに PNG ファイルがありません: $FolderPath"
            return
        }
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
            $item = @{
                file  = $fileName
                label = $existing[$fileName]
            }

            # 任意の要素を追加
            if ($Volume -ne 0) { $item.volume = $Volume }
            if ($Gap    -ne 0) { $item.gap    = $Gap }

            $jsonArray += $item
        }
    }

    # 新規ファイルを末尾に追加（アルファベット順、小文字比較で重複防止）
    $orderedLower = $orderedList | ForEach-Object { $_.ToLower() }
    $newFiles = $files | Where-Object { -not ($orderedLower -contains $_.ToLower()) } | Sort-Object
    foreach ($fileName in $newFiles) {
        $item = @{
            file  = $fileName
            label = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
        }

        if ($Volume -ne 0) { $item.volume = $Volume }
        if ($Gap    -ne 0) { $item.gap    = $Gap }

        $jsonArray += $item
    }

    # JSON書き出し（1行1オブジェクト形式）
    $lines = $jsonArray | ForEach-Object { $_ | ConvertTo-Json -Compress }
    $all = "[`n" + ($lines -join ",`n") + "`n]"
    [System.IO.File]::WriteAllText($JsonPath, $all, [System.Text.Encoding]::UTF8)

    Write-Host "JSON生成完了: $JsonPath"
}

# -------------------------------
# audio と exaudio とzooは従来通り
# -------------------------------
Update-AudioJson -FolderPath ".\audio" -JsonPath (Join-Path $PSScriptRoot "audio-list.json")
Update-AudioJson -FolderPath ".\exaudio" -JsonPath (Join-Path $PSScriptRoot "exaudio-list.json")
Update-AudioJson -FolderPath ".\zoo" -JsonPath (Join-Path $PSScriptRoot "zooaudio-list.json")

# -------------------------------
# animalSE は volume と gap を追加
# -------------------------------
Update-AudioJson -FolderPath ".\animalSE" -JsonPath (Join-Path $PSScriptRoot "animal-voice-list.json") -Volume 0.5 -Gap 0.2

# -------------------------------
# 他のフォルダ
# -------------------------------
Update-AudioJson -FolderPath ".\saineFace" -JsonPath (Join-Path $PSScriptRoot "face-list.json")
