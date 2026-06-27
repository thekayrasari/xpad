import fs from 'fs';
import path from 'path';

export class VPilotInstallerService {
    public static async installPlugin() {
        console.log("Checking for vPilot installation to auto-install plugin...");
        
        try {
            // Find the bundled plugins directory
            let sourcePluginsDir = '';
            
            const possibleSourcePaths = [
                path.join(__dirname, '../../../../plugins'), // dev (ts-node from src/services)
                path.join(__dirname, '../../../plugins'),    // dev (from dist/services)
                path.join((process as any).resourcesPath || '', 'app.asar/plugins'), // production
                path.join((process as any).resourcesPath || '', 'app/plugins'), // production unpacked
                path.join(__dirname, '../../plugins'), // fallback
            ];

            for (const p of possibleSourcePaths) {
                if (fs.existsSync(p) && fs.existsSync(path.join(p, 'xPadPlugin.dll'))) {
                    sourcePluginsDir = p;
                    break;
                }
            }

            if (!sourcePluginsDir) {
                console.log("Plugins directory not found in bundled resources. Skipping auto-install.");
                return;
            }

            // Determine possible vPilot installation paths
            const localAppData = process.env.LOCALAPPDATA;
            const programFiles = process.env.PROGRAMFILES;
            const programFilesX86 = process.env['PROGRAMFILES(X86)'];
            
            const searchPaths: string[] = [];
            
            if (localAppData) searchPaths.push(path.join(localAppData, 'vPilot'));
            if (programFiles) searchPaths.push(path.join(programFiles, 'vPilot'));
            if (programFilesX86) searchPaths.push(path.join(programFilesX86, 'vPilot'));
            searchPaths.push('C:/Program Files/Steam/steamapps/common/vPilot');
            searchPaths.push('C:/Program Files (x86)/Steam/steamapps/common/vPilot');

            let vPilotRoot = '';
            for (const p of searchPaths) {
                if (fs.existsSync(path.join(p, 'vPilot.exe'))) {
                    vPilotRoot = p;
                    break;
                }
            }

            if (!vPilotRoot) {
                console.log("vPilot not found in common installation paths. Skipping auto-install.");
                return;
            }

            console.log(`vPilot found at: ${vPilotRoot}`);
            const pluginsDir = path.join(vPilotRoot, 'Plugins');
            
            if (!fs.existsSync(pluginsDir)) {
                fs.mkdirSync(pluginsDir, { recursive: true });
                console.log(`Created Plugins directory at ${pluginsDir}`);
            }

            // Read all DLLs from our source plugins directory
            const dllFiles = fs.readdirSync(sourcePluginsDir).filter(file => file.endsWith('.dll'));

            for (const dll of dllFiles) {
                const sourceDllPath = path.join(sourcePluginsDir, dll);
                const targetDllPath = path.join(pluginsDir, dll);
                
                let needsCopy = true;
                if (fs.existsSync(targetDllPath)) {
                    const sourceStat = fs.statSync(sourceDllPath);
                    const targetStat = fs.statSync(targetDllPath);
                    if (sourceStat.size === targetStat.size) {
                        needsCopy = false;
                    }
                }

                if (needsCopy) {
                    try {
                        const fileBuffer = fs.readFileSync(sourceDllPath);
                        fs.writeFileSync(targetDllPath, fileBuffer);
                        console.log(`Successfully installed ${dll} to ${targetDllPath}`);
                    } catch (err: any) {
                        console.error(`Failed to copy ${dll} to ${targetDllPath}. Is vPilot currently running? Close it and restart xPad to apply the update. Error: ${err.message}`);
                    }
                } else {
                    console.log(`${dll} is already up to date in vPilot folder.`);
                }
            }

        } catch (error) {
            console.error("Error during vPilot auto-install:", error);
        }
    }
}
