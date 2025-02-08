export default function (plop) {
    // new route generator
    plop.setGenerator('new route/service/controller', {
        description: 'New route generator',
        prompts: [
            {
                type: 'input',
                name: 'service',
                message: 'Service name (e.g api)'
            },
            {
                type: 'input',
                name: 'version',
                message: 'Version (e.g v1)'
            },
            {
                type: 'input',
                name: 'name',
                message: 'Controller/Service function/file name (e.g get)'
            },
            {
                type: 'input',
                name: 'parent',
                message: 'Controller/Service parent (e.g user)'
            },
            {
                type: 'input',
                name: 'resourceGroup',
                message:
                    'Route resource group (e.g if api/v1/users/:userId -> /users) - note slash'
            },
            {
                type: 'input',
                name: 'resourceEnd',
                message:
                    'Route resource end (e.g if api/v1/users/:userId -> /:userId) - note slash'
            },
            {
                type: 'input',
                name: 'verb',
                message: 'HTTP Verb (e.g get/post)'
            }
        ],
        actions: [
            {
                type: 'add',
                path: 'src/{{service}}/controllers/{{version}}/{{parent}}/{{name}}.ts',
                templateFile: 'automation-templates/controllers/body.hbs'
            },
            {
                type: 'add',
                path: 'src/{{service}}/controllers/{{version}}/{{parent}}.controller.ts',
                templateFile: 'automation-templates/controllers/unifier.hbs'
            },
            {
                type: 'add',
                path: 'src/{{service}}/services/{{version}}/{{parent}}/{{name}}.ts',
                templateFile: 'automation-templates/services/body.hbs'
            },
            {
                type: 'add',
                path: 'src/{{service}}/services/{{version}}/{{parent}}.service.ts',
                templateFile: 'automation-templates/services/unifier.hbs'
            },
            {
                type: 'add',
                path: 'src/{{service}}/routes/api/{{version}}/{{parent}}.ts',
                templateFile: 'automation-templates/routes/body.hbs'
            },
            {
                type: 'modify',
                path: 'src/{{service}}/app.ts',
                pattern: /(\/\/ Automation: importRoute)/g,
                template: '{{ parent }}Router,\n$1'
            },
            {
                type: 'modify',
                path: 'src/{{service}}/app.ts',
                pattern: /(\/\/ Automation: addRoute)/g,
                template:
                    "app.use('/api/v1{{ resourceGroup }}', {{ parent }}Router);\n$1"
            },
            {
                type: 'modify',
                path: 'src/{{service}}/routes/api/{{ version }}/index.ts',
                pattern: /(\/\/ Automation: addImport)/g,
                template: "import {{ parent }}Router from './{{ parent }}';\n$1"
            },
            {
                type: 'modify',
                path: 'src/{{service}}/routes/api/{{ version }}/index.ts',
                pattern: /(\/\/ Automation: addExport)/g,
                template: '{{ parent }}Router,\n$1'
            }
        ]
    });

    // add route generator
    plop.setGenerator('add route/service/controller', {
        description: 'Add route generator',
        prompts: [
            {
                type: 'input',
                name: 'service',
                message: 'Service name (e.g api)'
            },
            {
                type: 'input',
                name: 'version',
                message: 'Version (e.g v1)'
            },
            {
                type: 'input',
                name: 'name',
                message: 'Controller/Service function/file name (e.g get)'
            },
            {
                type: 'input',
                name: 'parent',
                message: 'Controller/Service parent (e.g user)'
            },
            {
                type: 'input',
                name: 'resourceEnd',
                message:
                    'Route resource end (e.g if api/v1/users/:userId -> /:userId) - note slash'
            },
            {
                type: 'input',
                name: 'verb',
                message: 'HTTP Verb (e.g get/post)'
            }
        ],
        actions: [
            {
                type: 'add',
                path: 'src/{{service}}/controllers/{{version}}/{{parent}}/{{name}}.ts',
                templateFile: 'automation-templates/controllers/body.hbs'
            },
            {
                type: 'modify',
                path: 'src/{{service}}/controllers/{{ version }}/{{ parent }}.controller.ts',
                pattern: /(\/\/ Automation: addImport)/g,
                template:
                    "import {{ name }} from './{{ parent }}/{{ name }}';\n$1"
            },
            {
                type: 'modify',
                path: 'src/{{service}}/controllers/{{ version }}/{{ parent }}.controller.ts',
                pattern: /(\/\/ Automation: addExport)/g,
                template: '{{ name }},\n$1'
            },
            {
                type: 'add',
                path: 'src/{{service}}/services/{{version}}/{{parent}}/{{name}}.ts',
                templateFile: 'automation-templates/services/body.hbs'
            },
            {
                type: 'modify',
                path: 'src/{{service}}/services/{{ version }}/{{ parent }}.service.ts',
                pattern: /(\/\/ Automation: addImport)/g,
                template:
                    "import {{ name }} from './{{ parent }}/{{ name }}';\n$1"
            },
            {
                type: 'modify',
                path: 'src/{{service}}/services/{{ version }}/{{ parent }}.service.ts',
                pattern: /(\/\/ Automation: addExport)/g,
                template: '{{ name }},\n$1'
            },
            {
                type: 'modify',
                path: 'src/{{service}}/routes/api/{{ version }}/{{ parent }}.ts',
                pattern: /(\/\/ Automation: importController)/g,
                template: '{{ name }},\n$1'
            },
            {
                type: 'modify',
                path: 'src/{{service}}/routes/api/{{ version }}/{{ parent }}.ts',
                pattern: /(\/\/ Automation: addRoute)/g,
                template:
                    "{{ parent }}Router.{{ verb }}('{{ resourceEnd }}', MIDDLEWARE, {{ name }});\n$1"
            }
        ]
    });
}
