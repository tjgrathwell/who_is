function toTitleCase(string) {
    return string[0].toUpperCase() + string.substr(1);
}
function DifficultySelect({ selectedDifficulty }) {
    const difficulties = [
        'easy', 'medium', 'hard', 'hardest', 'reverse'
    ]

    return (
        <label className="difficulty-select">
            Difficulty:
            <select className="difficulty pull-right form-control" defaultValue={selectedDifficulty}>
                {
                    difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>{toTitleCase(difficulty)}</option>
                    ))
                }
            </select>
        </label>
    )
}

export default DifficultySelect
