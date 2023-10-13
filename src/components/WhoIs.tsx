import DifficultySelect from './DifficultySelect'
import SavedPeople from "./SavedPeople.tsx";

function WhoIs({selectedDifficulty}) {
    let sampleNames = `http://placebear.com/200/200 A Bear
https://placekitten.com/200/200 Kitty Cat`;

    return (
        <>
            <h1 data-link="restart">Who is?</h1>

            <div className="game hidden">
                <div className="row">
                    <div className="col-md-4 col-md-offset-2">
                        <div id="question" className="game-pane"></div>
                    </div>
                    <div className="col-md-4">
                        <div id="answer" className="game-pane"></div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-md-offset-3 scores">
                    </div>
                </div>
            </div>

            <div className="entry">
                Enter a series of image URLs and Names, in the following format
                <pre>{sampleNames}</pre>
                <textarea></textarea>
                <button className="btn btn-primary begin-button">Begin!</button>
                <input className='form-control save-as-name' placeholder="Save as..." />
                <div className="saved-people">
                    <SavedPeople/>
                </div>
            </div>

            <div className="row mb10 mt10">
                <div className="col-md-6 col-md-offset-3 difficulty-select-container">
                    <DifficultySelect selectedDifficulty={selectedDifficulty} />
                </div>
            </div>

            <div className="form-group replay hidden">
                <h1>GAME COMPLETE</h1>
                <button className="btn btn-primary">Replay?</button>
            </div>

            <div className="form-group restart hidden">
                <button className="btn btn-primary" data-link="restart">Restart with a new set of names?</button>
            </div>

            <div className="failures hidden">
                <h3>Hall of Mistakes</h3>
                <div className="photos mb10 mt10"></div>

                <div className="restart-mistakes">
                    <button className="btn btn-primary" data-link='restart-mistakes'>Create a new list of just these people!</button>
                </div>
            </div>
        </>
    )
}

export default WhoIs