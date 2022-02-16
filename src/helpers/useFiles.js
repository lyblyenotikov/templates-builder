const fs = require('fs')
const { FILE_TYPES } = require('../utils/templates')
const { resolve } = require('path')
const {
    kebabCaseTransform,
    pascalCaseTransform,
    snakeCaseTransform,
    camelCaseTransform,
} = require('./useTransform')

const builder = new (require('../services/TemplateBuilder').BuildTemplate)()

async function appendItems(path, lastElement, config = {}) {
    console.log(config, 'useFiles')
    const { transformType } = config
    const transform = getCorrectTransformType(transformType)
    const files = transformFilenames(transform(lastElement), config)
    for (const currentFile of files) {
        const element = resolve(path, currentFile)
        await fs.promises.writeFile(element, ``).then(() => {
            console.log(lastElement, currentFile)
            fs.promises.appendFile(element, builder.build(lastElement))
        })
    }
}

function getCorrectTransformType(type) {
    switch (type) {
        case 'kebab':
            return kebabCaseTransform
        case 'snake':
            return snakeCaseTransform
        case 'pascal':
            return pascalCaseTransform
        default:
            return camelCaseTransform
    }
}

function transformFilenames(filename, config) {
    const { extension, fileTypes, reExport } = config
    const acceptedTypes = fileTypes || FILE_TYPES
    return acceptedTypes
        .map((type) => {
            if (type === 'index') {
                return reExport
                    ? [`${type}.${extension}`, `${filename}.${extension}`]
                    : `${type}.${extension}`
            }
            return `${filename}.${type}.${extension}`
        })
        .flat()
}

module.exports = { appendItems }
