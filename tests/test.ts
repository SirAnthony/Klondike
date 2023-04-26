import cy from 'cypress'
import conf from '../src/config'

/*
describe('React App', () => {
  it('should render without errors', () => {
    cy.visit('http://localhost:${conf.server.port}');

    cy.get('#root').should('exist');

    cy.get('div')
      .should('have.class', 'App')
      .and('have.class', 'container');

    cy.get('h1')
      .should('have.text', 'Welcome to My React App');
  });
});
*/

class ID {
    _id: number
}
class Named extends ID {
    name: string
}

type Constructor = new (...args: any[]) => ID;
export function MakeController<TBase extends Constructor>(Base: TBase, db: string){
    class DBBase extends Base {
        created: Date
    }
    return class Controller extends DBBase {
        protected constructor(...args: any[]){
            const [data] = args
            super();
            for (let k in data)
                this[k] = data[k]
            return this
        }
        static async get(data: Controller | DBBase | TBase | string, fields?) : Promise<Controller>{
            if (data instanceof Controller)
                return data as Controller
            return new Controller(data, fields)
        }
    }
}

async function getName() : Promise<string> {
    const CTRL = MakeController(Named, 'db')
    const ctrl = await CTRL.get('obj')
    return ctrl.name
}

getName()
