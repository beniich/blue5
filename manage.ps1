# ========================================
# Script de Gestion - School 1cc & CRM Pro.cc
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('install', 'dev', 'build', 'clean', 'status', 'update', 'help')]
    [string]$Action = 'help',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('school', 'crm', 'both')]
    [string]$Project = 'both'
)

# Configuration
$SCHOOL_PATH = "D:\git produit\crm\crm-hub-main\dash1cc\school-1cc"
$CRM_PATH = "D:\git produit\crm\crm-hub-main\dash1cc\crm-pro"

$PROJECTS = @{
    'school' = @{
        Name = 'School 1cc'
        Path = $SCHOOL_PATH
        Port = 5173
        Color = 'Blue'
    }
    'crm' = @{
        Name = 'CRM Pro.cc'
        Path = $CRM_PATH
        Port = 5174
        Color = 'Green'
    }
}

# Fonctions utilitaires
function Write-ColoredMessage {
    param(
        [string]$Message,
        [string]$Color = 'White',
        [switch]$NoNewLine
    )
    
    if ($NoNewLine) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Write-Header {
    param([string]$Title)
    
    Write-Host ""
    Write-ColoredMessage "╔════════════════════════════════════════════════════════╗" -Color Cyan
    Write-ColoredMessage "║  $Title" -Color Cyan
    Write-ColoredMessage "╚════════════════════════════════════════════════════════╝" -Color Cyan
    Write-Host ""
}

function Execute-Command {
    param(
        [string]$Command,
        [string]$WorkingDirectory,
        [string]$ProjectName
    )
    
    Write-ColoredMessage "🔧 Exécution: $Command" -Color Yellow
    Write-ColoredMessage "📂 Dans: $WorkingDirectory" -Color DarkGray
    Write-Host ""
    
    try {
        Push-Location $WorkingDirectory
        Invoke-Expression $Command
        Pop-Location
        
        Write-ColoredMessage "✅ Succès pour $ProjectName" -Color Green
        return $true
    } catch {
        Write-ColoredMessage "❌ Erreur pour ${ProjectName}: $_" -Color Red
        Pop-Location
        return $false
    }
}

function Show-ProjectInfo {
    param([hashtable]$ProjectInfo)
    
    Write-ColoredMessage "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color DarkGray
    Write-ColoredMessage "📦 Projet: " -Color White -NoNewLine
    Write-ColoredMessage $ProjectInfo.Name -Color $ProjectInfo.Color
    Write-ColoredMessage "📂 Chemin: $($ProjectInfo.Path)" -Color DarkGray
    Write-ColoredMessage "🌐 Port: $($ProjectInfo.Port)" -Color DarkGray
}

# Actions
function Install-Dependencies {
    param([string]$Target)
    
    Write-Header "Installation des dépendances"
    
    $projects = if ($Target -eq 'both') { @('school', 'crm') } else { @($Target) }
    
    foreach ($proj in $projects) {
        $info = $PROJECTS[$proj]
        Show-ProjectInfo $info
        Execute-Command "npm install" $info.Path $info.Name
        Write-Host ""
    }
}

function Start-Development {
    param([string]$Target)
    
    Write-Header "Démarrage en mode développement"
    
    if ($Target -eq 'both') {
        Write-ColoredMessage "⚠️  Démarrage des deux applications en parallèle..." -Color Yellow
        Write-Host ""
        
        # Démarrer School 1cc dans une nouvelle fenêtre
        $schoolInfo = $PROJECTS['school']
        Show-ProjectInfo $schoolInfo
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($schoolInfo.Path)'; npm run dev"
        
        Write-Host ""
        Start-Sleep -Seconds 2
        
        # Démarrer CRM Pro.cc dans une nouvelle fenêtre
        $crmInfo = $PROJECTS['crm']
        Show-ProjectInfo $crmInfo
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($crmInfo.Path)'; npm run dev"
        
        Write-Host ""
        Write-ColoredMessage "✅ Les deux applications ont été lancées dans des fenêtres séparées" -Color Green
        Write-ColoredMessage "🌐 School 1cc: http://localhost:5173" -Color Blue
        Write-ColoredMessage "🌐 CRM Pro.cc: http://localhost:5174" -Color Green
    } else {
        $info = $PROJECTS[$Target]
        Show-ProjectInfo $info
        Write-ColoredMessage "🌐 URL: http://localhost:$($info.Port)" -Color Cyan
        Write-Host ""
        Execute-Command "npm run dev" $info.Path $info.Name
    }
}

function Build-Production {
    param([string]$Target)
    
    Write-Header "Build Production"
    
    $projects = if ($Target -eq 'both') { @('school', 'crm') } else { @($Target) }
    
    foreach ($proj in $projects) {
        $info = $PROJECTS[$proj]
        Show-ProjectInfo $info
        Execute-Command "npm run build" $info.Path $info.Name
        Write-Host ""
    }
}

function Clear-Projects {
    param([string]$Target)
    
    Write-Header "Nettoyage des projets"
    
    $projects = if ($Target -eq 'both') { @('school', 'crm') } else { @($Target) }
    
    foreach ($proj in $projects) {
        $info = $PROJECTS[$proj]
        Show-ProjectInfo $info
        
        $nodeModules = Join-Path $info.Path "node_modules"
        $dist = Join-Path $info.Path "dist"
        
        if (Test-Path $nodeModules) {
            Write-ColoredMessage "🗑️  Suppression de node_modules..." -Color Yellow
            Remove-Item $nodeModules -Recurse -Force
            Write-ColoredMessage "✅ node_modules supprimé" -Color Green
        } else {
            Write-ColoredMessage "ℹ️  node_modules n'existe pas" -Color DarkGray
        }
        
        if (Test-Path $dist) {
            Write-ColoredMessage "🗑️  Suppression de dist..." -Color Yellow
            Remove-Item $dist -Recurse -Force
            Write-ColoredMessage "✅ dist supprimé" -Color Green
        } else {
            Write-ColoredMessage "ℹ️  dist n'existe pas" -Color DarkGray
        }
        
        Write-Host ""
    }
}

function Show-Status {
    Write-Header "État des projets"
    
    foreach ($key in $PROJECTS.Keys) {
        $info = $PROJECTS[$key]
        Show-ProjectInfo $info
        
        $packageJson = Join-Path $info.Path "package.json"
        
        if (Test-Path $packageJson) {
            try {
                $package = Get-Content $packageJson | ConvertFrom-Json
                Write-ColoredMessage "📦 Package: $($package.name) v$($package.version)" -Color White
                
                $nodeModules = Join-Path $info.Path "node_modules"
                if (Test-Path $nodeModules) {
                    Write-ColoredMessage "✅ node_modules installé" -Color Green
                } else {
                    Write-ColoredMessage "⚠️  node_modules non installé" -Color Yellow
                }
                
                $dist = Join-Path $info.Path "dist"
                if (Test-Path $dist) {
                    Write-ColoredMessage "✅ Build disponible (dist/)" -Color Green
                } else {
                    Write-ColoredMessage "ℹ️  Pas de build (dist/)" -Color DarkGray
                }
            } catch {
                Write-ColoredMessage "❌ Erreur lors de la lecture du package.json" -Color Red
            }
        } else {
            Write-ColoredMessage "❌ package.json introuvable" -Color Red
        }
        
        Write-Host ""
    }
}

function Update-Dependencies {
    param([string]$Target)
    
    Write-Header "Mise à jour des dépendances"
    
    $projects = if ($Target -eq 'both') { @('school', 'crm') } else { @($Target) }
    
    foreach ($proj in $projects) {
        $info = $PROJECTS[$proj]
        Show-ProjectInfo $info
        Execute-Command "npm update" $info.Path $info.Name
        Write-Host ""
    }
}

function Show-Help {
    Write-Header "Aide - Script de Gestion"
    
    Write-ColoredMessage "📚 SCHOOL 1CC" -Color Blue
    Write-Host "   Plateforme de Gestion Scolaire Intelligente"
    Write-Host ""
    
    Write-ColoredMessage "🏥 CRM PRO.CC" -Color Green
    Write-Host "   Plateforme de Gestion Hospitalière et CRM"
    Write-Host ""
    
    Write-ColoredMessage "UTILISATION:" -Color Yellow
    Write-Host "  .\manage.ps1 -Action <action> -Project <project>"
    Write-Host ""
    
    Write-ColoredMessage "ACTIONS DISPONIBLES:" -Color Yellow
    Write-Host "  install     Installation des dépendances (npm install)"
    Write-Host "  dev         Démarrage en mode développement"
    Write-Host "  build       Build de production"
    Write-Host "  clean       Nettoyage (supprime node_modules et dist)"
    Write-Host "  status      Affiche l'état des projets"
    Write-Host "  update      Mise à jour des dépendances"
    Write-Host "  help        Affiche cette aide"
    Write-Host ""
    
    Write-ColoredMessage "PROJETS:" -Color Yellow
    Write-Host "  school      School 1cc uniquement"
    Write-Host "  crm         CRM Pro.cc uniquement"
    Write-Host "  both        Les deux projets (défaut)"
    Write-Host ""
    
    Write-ColoredMessage "EXEMPLES:" -Color Cyan
    Write-Host "  .\manage.ps1 -Action install -Project both"
    Write-Host "  .\manage.ps1 -Action dev -Project school"
    Write-Host "  .\manage.ps1 -Action build -Project crm"
    Write-Host "  .\manage.ps1 -Action status"
    Write-Host "  .\manage.ps1 -Action clean -Project both"
    Write-Host ""
    
    Write-ColoredMessage "RACCOURCIS RAPIDES:" -Color Cyan
    Write-Host "  .\manage.ps1 install          # Installe les deux projets"
    Write-Host "  .\manage.ps1 dev              # Démarre les deux projets"
    Write-Host "  .\manage.ps1 status           # Affiche l'état"
    Write-Host ""
}

# Exécution principale
Clear-Host

switch ($Action) {
    'install' { Install-Dependencies $Project }
    'dev' { Start-Development $Project }
    'build' { Build-Production $Project }
    'clean' { Clear-Projects $Project }
    'status' { Show-Status }
    'update' { Update-Dependencies $Project }
    'help' { Show-Help }
    default { Show-Help }
}

Write-Host ""
Write-ColoredMessage "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color DarkGray
Write-ColoredMessage "✨ Terminé !" -Color Cyan
Write-Host ""
