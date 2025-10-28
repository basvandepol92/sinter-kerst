import { createRouter, createWebHashHistory } from 'vue-router';
const SplashView = () => import('../views/SplashView.vue');
const InstructionsView = () => import('../views/InstructionsView.vue');
const SettingsView = () => import('../views/SettingsView.vue');
const ChallengeManagerView = () => import('../views/ChallengeManagerView.vue');
const GameView = () => import('../views/GameView.vue');
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'home', component: SplashView },
        { path: '/uitleg', name: 'info', component: InstructionsView },
        { path: '/instellingen', name: 'settings', component: SettingsView },
        { path: '/challenges', name: 'challenges', component: ChallengeManagerView },
        { path: '/spel', name: 'game', component: GameView }
    ]
});
export default router;
