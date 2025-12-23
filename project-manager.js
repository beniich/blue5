#!/usr/bin/env node

/**
 * Script de Gestion Centralisé - School 1cc & CRM Pro.cc
 * Permet de gérer facilement les deux applications
 */

const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration des chemins
const PROJECTS = {
  school: {
    name: 'School 1cc',
    path: 'D:\\git produit\\crm\\crm-hub-main\\dash1cc\\school-1cc',
    port: 5173,
    color: '\x1b[34m', // Bleu
  },
  crm: {
    name: 'CRM Pro.cc',
    path: 'D:\\git produit\\crm\\crm-hub-main\\dash1cc\\crm-pro',
    port: 5174,
    color: '\x1b[32m', // Vert
  }
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Fonctions utilitaires
function executeCommand(command, cwd) {
  try {
    console.log(`\n${BOLD}Exécution: ${command}${RESET}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution: ${error.message}`);
    return false;
  }
}

function showMenu() {
  console.clear();
  console.log(`
${BOLD}╔════════════════════════════════════════════════════════╗
║     Gestionnaire School 1cc & CRM Pro.cc              ║
╚════════════════════════════════════════════════════════╝${RESET}

${PROJECTS.school.color}📚 School 1cc${RESET} - Gestion Scolaire
${PROJECTS.crm.color}🏥 CRM Pro.cc${RESET} - Gestion Hospitalière

${BOLD}Actions disponibles:${RESET}
  1️⃣  - Installer les dépendances (School 1cc)
  2️⃣  - Installer les dépendances (CRM Pro.cc)
  3️⃣  - Installer les deux applications
  
  4️⃣  - Démarrer School 1cc (dev)
  5️⃣  - Démarrer CRM Pro.cc (dev)
  6️⃣  - Démarrer les deux applications
  
  7️⃣  - Build School 1cc (production)
  8️⃣  - Build CRM Pro.cc (production)
  9️⃣  - Build les deux applications
  
  🔍 - Vérifier l'état des projets
  📦 - Mettre à jour les dépendances
  🧹 - Nettoyer (node_modules + dist)
  
  0️⃣  - Quitter

`);
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Actions
async function installDependencies(project) {
  const proj = PROJECTS[project];
  console.log(`\n${proj.color}${BOLD}📦 Installation des dépendances - ${proj.name}${RESET}`);
  return executeCommand('npm install', proj.path);
}

async function startDev(project) {
  const proj = PROJECTS[project];
  console.log(`\n${proj.color}${BOLD}🚀 Démarrage en mode développement - ${proj.name}${RESET}`);
  console.log(`📍 URL: http://localhost:${proj.port}`);
  return executeCommand('npm run dev', proj.path);
}

async function buildProduction(project) {
  const proj = PROJECTS[project];
  console.log(`\n${proj.color}${BOLD}🏗️  Build production - ${proj.name}${RESET}`);
  return executeCommand('npm run build', proj.path);
}

async function checkStatus() {
  console.log(`\n${BOLD}🔍 Vérification de l'état des projets${RESET}\n`);
  
  for (const [key, proj] of Object.entries(PROJECTS)) {
    console.log(`${proj.color}${BOLD}${proj.name}${RESET}`);
    console.log(`📂 Chemin: ${proj.path}`);
    
    try {
      const packageJson = require(path.join(proj.path, 'package.json'));
      console.log(`📦 Package: ${packageJson.name} v${packageJson.version}`);
      console.log(`✅ Status: OK\n`);
    } catch (error) {
      console.log(`❌ Status: package.json non trouvé\n`);
    }
  }
}

async function updateDependencies(project) {
  const proj = PROJECTS[project];
  console.log(`\n${proj.color}${BOLD}📦 Mise à jour des dépendances - ${proj.name}${RESET}`);
  return executeCommand('npm update', proj.path);
}

async function clean(project) {
  const proj = PROJECTS[project];
  console.log(`\n${proj.color}${BOLD}🧹 Nettoyage - ${proj.name}${RESET}`);
  
  // Suppression de node_modules et dist
  const commands = [
    'rmdir /s /q node_modules 2>nul || echo node_modules déjà supprimé',
    'rmdir /s /q dist 2>nul || echo dist déjà supprimé'
  ];
  
  for (const cmd of commands) {
    executeCommand(cmd, proj.path);
  }
  
  return true;
}

// Boucle principale
async function main() {
  let running = true;
  
  while (running) {
    showMenu();
    const choice = await promptUser(`${BOLD}Votre choix:${RESET} `);
    
    switch (choice) {
      case '1':
        await installDependencies('school');
        break;
      case '2':
        await installDependencies('crm');
        break;
      case '3':
        await installDependencies('school');
        await installDependencies('crm');
        break;
      case '4':
        await startDev('school');
        break;
      case '5':
        await startDev('crm');
        break;
      case '6':
        console.log(`\n${BOLD}⚠️  Démarrage en parallèle non supporté dans ce script${RESET}`);
        console.log(`Utilisez deux terminaux séparés pour démarrer les deux applications.`);
        break;
      case '7':
        await buildProduction('school');
        break;
      case '8':
        await buildProduction('crm');
        break;
      case '9':
        await buildProduction('school');
        await buildProduction('crm');
        break;
      case '🔍':
      case 'status':
        await checkStatus();
        break;
      case '📦':
      case 'update':
        const projToUpdate = await promptUser('Projet à mettre à jour (school/crm/both): ');
        if (projToUpdate === 'both') {
          await updateDependencies('school');
          await updateDependencies('crm');
        } else if (PROJECTS[projToUpdate]) {
          await updateDependencies(projToUpdate);
        }
        break;
      case '🧹':
      case 'clean':
        const projToClean = await promptUser('Projet à nettoyer (school/crm/both): ');
        if (projToClean === 'both') {
          await clean('school');
          await clean('crm');
        } else if (PROJECTS[projToClean]) {
          await clean(projToClean);
        }
        break;
      case '0':
      case 'exit':
      case 'quit':
        running = false;
        console.log(`\n${BOLD}👋 Au revoir !${RESET}\n`);
        break;
      default:
        console.log(`\n❌ Choix invalide. Appuyez sur Entrée pour continuer...`);
    }
    
    if (running && choice !== '4' && choice !== '5') {
      await promptUser('\nAppuyez sur Entrée pour continuer...');
    }
  }
  
  rl.close();
}

// Démarrage
main().catch(console.error);
