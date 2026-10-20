import express from 'express';
import { authenticate, restrictByRole, isActiveDictator, ownsContestant } from '../middlewares/authMiddleware';
import { createContestant, getContestants, updateContestant, releaseContestant, giveItem, applyBuff, getContestantDetails } from '../controllers/contestantController';
import { buyItemFromBlackMarket, getBlackMarketItems } from '../controllers/marketController';
import { placeBet } from '../controllers/betController';
import { getAvailableOpponents, proposeBattle } from '../controllers/battleController';
import { listActiveBattles } from '../controllers/sponsorController';
import { applyBuffDuringBattle } from '../controllers/sponsorController';
import { getMyBets } from '../controllers/battleController';
import { getDictatorInventory, addItemToDictatorInventory, deleteItemFromDictatorInventory } from '../controllers/dictatorController';

const router = express.Router();

// Rutas existentes
router.get('/contestants/:contestantId/details', authenticate, restrictByRole(['Dictator']), getContestantDetails);
router.get('/contestants', authenticate, restrictByRole(['Dictator']), getContestants);
router.post('/add-contestants', authenticate, restrictByRole(['Dictator']), isActiveDictator, createContestant);
router.get('/blackmarket/Activity', authenticate, restrictByRole(['Dictator']), isActiveDictator, getBlackMarketItems);
router.post('/blackmarket/buy-item', authenticate, restrictByRole(['Dictator']), isActiveDictator, buyItemFromBlackMarket);
router.post('/give-item', authenticate, restrictByRole(['Dictator']), giveItem);
router.post('/apply-buff', authenticate, restrictByRole(['Dictator']), applyBuff);
router.post('/apply-buff/battle', authenticate, restrictByRole(['Dictator']), applyBuffDuringBattle);
router.put('/contestants/:contestantId', authenticate, restrictByRole(['Dictator']), isActiveDictator, updateContestant);
router.delete('/Release-contestants/:contestantId', authenticate, restrictByRole(['Dictator']), isActiveDictator, releaseContestant);
router.get('/available-opponents', authenticate, restrictByRole(['Dictator']), isActiveDictator, getAvailableOpponents);
router.post('/propose-battle', authenticate, restrictByRole(['Dictator']), isActiveDictator, proposeBattle);
router.get('/inventory', authenticate, restrictByRole(['Dictator']), getDictatorInventory);
router.post('/add-item', authenticate, restrictByRole(['Dictator']), addItemToDictatorInventory);
router.delete('/delete-item', authenticate, restrictByRole(['Dictator']), deleteItemFromDictatorInventory);
router.get('/battles/active', authenticate, restrictByRole(['Dictator']), listActiveBattles);
router.post("/place-bet", authenticate, restrictByRole(['Dictator']), placeBet);
router.get('/my-bets', authenticate, restrictByRole(['Dictator']), getMyBets);

export default router;
