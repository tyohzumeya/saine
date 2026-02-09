Set-Location -Path $PSScriptRoot

$audioFolder = ".\audio"
$jsonFile = Join-Path $PSScriptRoot "audio-list.json"

# audioフォルダがあるか確認
if (!(Test-Path $audioFolder)) {
    Write-Host "audio フォルダが見つかりません: $audioFolder"
    Read-Host "Enterキーを押すと終了します"
    exit
}

# WAVファイル取得
$files = Get-ChildItem $audioFolder -Filter *.wav
if ($files.Count -eq 0) {
    Write-Host "audio フォルダに WAV ファイルがありません"
    Read-Host "Enterキーを押すと終了します"
    exit
}

# 既存 JSON を読み込み（存在する場合）
$existing = @{}
if (Test-Path $jsonFile) {
    try {
        $existingJson = Get-Content $jsonFile -Raw | ConvertFrom-Json
        foreach ($item in $existingJson) {
            $existing[$item.file] = $item.label
        }
    } catch {
        Write-Host "既存 JSON が壊れているか無効です。新規作成します。"
    }
}

# 新しい JSON 配列作成
$jsonArray = @()
foreach ($file in $files) {
    $label = if ($existing.ContainsKey($file.Name)) { 
        $existing[$file.Name]  # 既存の日本語ラベルを保持
    } else {
        [System.IO.Path]::GetFileNameWithoutExtension($file.Name)  # 新規ファイルはファイル名ベース
    }

    $jsonArray += @{
        file  = $file.Name
        label = $label
    }
}

# 1行1オブジェクト形式で書き出す
$lines = $jsonArray | ForEach-Object { $_ | ConvertTo-Json -Compress }
$all = "[`n" + ($lines -join ",`n") + "`n]"
[System.IO.File]::WriteAllText($jsonFile, $all, [System.Text.Encoding]::UTF8)

Write-Host "JSON生成完了: $jsonFile"
