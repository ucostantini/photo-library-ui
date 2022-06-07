import 'jest-extended';
import { CardController } from '../../src/core/cardController';

describe('JeuDeDesTest', () => {
  let controller: CardController;
  beforeEach(async () => {
    controller = new CardController();
  });

  it('demarrerJeux', async () => {
    const result = controller.demarrerJeu('yvan');
    expect(result).toEqual("{\"nom\":\"yvan\",\"lancers\":0,\"lancersGagnes\":0}");

    expect(() => {
      controller.demarrerJeu('yvan')
    }).toThrow("Joueur 'yvan' existe déjà.");

    const resultat = controller.jouer('yvan');
    expect(JSON.parse(resultat).lancers).toEqual(1);

    controller.brasser();
    expect(JSON.parse(controller.joueurs)[0].lancers).toEqual(1)
  })

});
