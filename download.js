const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const { promises: { writeFile, readFile },  existsSync } = require("fs");

const [server, sourcePath] = process.argv[2].split(":");
const destinationPath = process.argv[3];
const ignoreFile = `${destinationPath}/.download-once-ignore`;

const getIgnoreList = () => readFile(ignoreFile).then(ignoreList => ignoreList.toString().split("\n")).catch(() => []);
const addToIgnoreList = file => writeFile(ignoreFile, `${file}\n`, { flag: "a" });
const getFilesInSource = () => exec(`ssh ${server} "find ${sourcePath} -not -type d"`).then(({ stdout: files }) => files.toString().split("\n").filter(file => file.length));
const getFilesToDownload = async () =>  {
    const [ignoreList, filesInSource] = await Promise.all([getIgnoreList(), getFilesInSource()]);
    return filesInSource.filter(file => !ignoreList.includes(file));
}
const getFolder = file => file.substr(0, file.lastIndexOf("/"));
const translateToDestination = file => file.replace(sourcePath, destinationPath);
const createDestinationFolder = file => exec(`mkdir -p ${translateToDestination(getFolder(file))}`);
const download = file => exec(`scp ${server}:${file} ${translateToDestination(file)}`);
const downloadFiles = async files => {
    for (const file of files) {
        try {
            if (existsSync(translateToDestination(file))) {
                continue;
            }

            console.log(file);
            await createDestinationFolder(file);
            await download(file);
            await addToIgnoreList(file);
        } catch (e) {
            console.error(e);
        }
    }
}

getFilesToDownload().then(downloadFiles);