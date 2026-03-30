import { shadows } from '../../theme';
import Checkbox from '../checkbox';

export default function DraggableStore({ store, isSelected, setSelected }) {
    return (<div onClick={() => setSelected(store)} className="card">
        {store.Name}
        <div className="card-check">
            <Checkbox checked={isSelected} changeHandler={() => setSelected(store)} />
        </div>

        <style jsx>{`
          
          .card {
            font-size: 0.85rem;
            cursor: pointer;
            width: 240px;
            background: white;
            padding: 1rem;
            box-shadow: ${shadows.card};
            margin: 0 0 0.5rem 0;
            border-radius: 3px;
            position: relative;
        }

        .card-check {
            position: absolute;
            right: 16px;
            top: 10px;
            z-index: 1;
          }

          `}</style>
    </div>);
}