type User = {
    name: string;
    id: string;
    color: string;
};

type AdminGame = {
    number: number;
    id: string;
    score: string;
};

const users: User[] = [
    { name: 'Alice', id: '10056', color: '#8ad746' },
    { name: 'Bob', id: '08033', color: '#0865f5' },
    { name: 'Casie', id: '01056', color: '#ffa63c' },
];

const games: AdminGame[] = [
    { number: 1, id: '101', score: '(Alice) 10 - 8 (Bob)' },
    { number: 2, id: '121', score: '(Casie) 9 - 3 (Bob)' },
    { number: 3, id: '111', score: '(Casie) 7 - 6 (Alice)' },
];

const usersList = document.querySelector('#users-list')!;
const gamesList = document.querySelector('#games-list')!;

function renderUsers(): void {
    usersList.replaceChildren();

    users.forEach((user) => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.style.backgroundColor = user.color;
        avatar.textContent = user.name[0];

        const details = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'user-name';
        name.textContent = user.name;

        const id = document.createElement('div');
        id.className = 'user-id';
        id.textContent = `ID: #${user.id}`;

        details.append(name, id);
        card.append(avatar, details);
        usersList.appendChild(card);
    });
}

function renderGames(): void {
    gamesList?.replaceChildren();

    games.forEach((game) => {
        const card = document.createElement('div');
        card.className = 'game-card';

        const info = document.createElement('div');

        const title = document.createElement('div');
        title.className = 'game-title';
        title.textContent = `Game #${game.number}`;

        const id = document.createElement('div');
        id.className = 'game-id';
        id.textContent = `Game ID: #${game.id}`;

        info.append(title, id);

        const scoreInfo = document.createElement('div');

        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'game-score-label';
        scoreLabel.textContent = 'Score';

        const score = document.createElement('div');
        score.className = 'game-score';
        score.textContent = game.score;

        scoreInfo.append(scoreLabel, score);

        const reset = document.createElement('button');
        reset.className = 'reset-btn';
        reset.type = 'button';
        reset.textContent = '⟳ Reset';

        reset.addEventListener('click', () => {
            alert('Reset will be available when the admin API is connected.');
        });

        card.append(info, scoreInfo, reset);
        gamesList?.appendChild(card);
    });
}

document.querySelector('#join-room')?.addEventListener('click', () => {
    alert('Room joining will be connected to the backend later.');
});

renderUsers();
renderGames();
