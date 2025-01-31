import { RecordList } from './Records';
import './Index.css';

export default function IndexPage() {
    return (
        <div id="container">
            <header>
                <h1>Header</h1>
            </header>
            <main>
                <RecordList />
            </main>
            <footer>
                <h1>
                    Footer
                </h1>
            </footer>
        </div>
    );
}