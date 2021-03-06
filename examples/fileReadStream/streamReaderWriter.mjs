import {fileReadStream, fileWriteStream} from '../../src/functional/nodeStreams/fileReader'
import {option} from '../../src/functional/utils/option'

import path from 'path'

const tmpDir = path.resolve('./');
const sourcePath = (source = './data/emojilist.txt') => path.resolve(source);
const destinationPath = (destination = './emojilistUppper.txt') => path.resolve(tmpDir, destination);

//Read File
const stringToUpperCaseStream = (source, destination) => fileReadStream(source)
//Decode chunk
    .map(chunk => chunk.toString('utf8'))
    //Chunk to UpperCase
    .map(string => string.toUpperCase())
    //Write to stream
    .through(fileWriteStream(destination))
    .run();


const [source, destination] = process.argv.slice(2);

const isHelp = (source) => source === '--help' || source === '-h';
const hasArguments = (source, destination) => source && destination;

option()
    .or(hasArguments(source, destination),
        () => stringToUpperCaseStream(sourcePath(source), destinationPath(destination))
            .then(() => {
                console.log(`Stream Finished! File: ${destination}, is available now!`)
            })
    )
    .or(isHelp(source), () => console.log('Add source and destination as arguments. \n For example:\n node streamReaderWriter.js ./data/emojilist.txt ./emojilistUppper.txt \n'))
    .finally(() => console.error('Source and destination are not defined! use --help for more information'))

//example command node --experimental-modules streamReaderWriter.mjs ./data/emojilist.txt ./emojilistUppper.txt


