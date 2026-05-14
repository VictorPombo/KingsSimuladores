import { AlertTriangle } from 'lucide-react'

export function MaintenanceBanner() {
  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3 text-center">
      <div className="container mx-auto">
        <p className="text-sm font-medium text-yellow-500 max-w-4xl mx-auto text-center">
          <AlertTriangle className="h-4 w-4 inline-block mb-1 mr-2 shrink-0" />
          <strong className="font-bold">Aviso de Manutenção:</strong> O site está passando por atualizações. 
          Alguns preços podem estar incorretos e pedidos com erros de valor poderão ser cancelados.
        </p>
      </div>
    </div>
  )
}
