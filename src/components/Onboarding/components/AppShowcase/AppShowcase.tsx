import { APP_SHOWCASE_ITEMS } from '../../constants/appShowcaseItems'
import { AppShowcaseCard } from '../AppShowcaseCard'

export function AppShowcase(): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {APP_SHOWCASE_ITEMS.map((item, index) => (
        <AppShowcaseCard key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}
