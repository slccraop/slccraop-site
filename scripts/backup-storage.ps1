# Storage bucket backup script for SLCCRAOP
# Backs up Supabase storage buckets (evidence-uploads, etc.)

$SupabaseUrl = "https://placeholder.supabase.co"
$SupabaseAnonKey = "placeholder-anon-key-only"
$BackupDirectory = "E:\SLCCRAOP\slccraop-site\backups"
$RetentionDays = 90  # Longer retention for storage backups

# Ensure backup directory exists
if (-Not (Test-Path $BackupDirectory)) {
    New-Item -ItemType Directory -Path $BackupDirectory | Out-Null
}

Write-Host "Starting Supabase storage bucket backup"
Write-Host "Backup directory: $BackupDirectory"
Write-Host "Retention policy: $RetentionDays days"

# In production: supabase storage dump --bucket evidence-uploads --path backups/
# For development - simulate backup
$date = Get-Date
$backupFile = Join-Path $BackupDirectory "supabase-storage-backup-$($date.ToString("yyyyMMdd_HHmmss")).json"

Write-Host "Creating storage backup file: $backupFile"
Write-Host "NOTE: Real storage backup requires Supabase CLI with bucket access"

# Create placeholder backup file
$date | Out-File -FilePath $backupFile -Encoding UTF8

Write-Host "Storage backup completed: $backupFile"
Write-Host "Backup includes: evidence-uploads bucket metadata (FAKE data only)"

# Cleanup old backups older than retention period
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldFiles = Get-ChildItem $BackupDirectory | Where-Object { $_.LastWriteTime -lt $cutoffDate -and $_.Name -match "supabase-storage" }

foreach ($file in $oldFiles) {
    Write-Host "Removing old storage backup: $($file.FullName)"
    Remove-Item $file.FullName
}

Write-Host "Backup cleanup completed. Retention: $RetentionDays days."