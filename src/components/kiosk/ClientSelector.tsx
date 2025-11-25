import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus, Search, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { Client } from '@/lib/api/clients'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ClientSelectorProps {
    selectedClientId?: string
    onClientSelect: (clientId: string | undefined) => void
}

export function ClientSelector({ selectedClientId, onClientSelect }: ClientSelectorProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Create Client Form State
    const [newClientName, setNewClientName] = useState('')
    const [newClientPhone, setNewClientPhone] = useState('')
    const [newClientEmail, setNewClientEmail] = useState('')

    const { data: clients, isLoading } = useClients(search)
    const createClientMutation = useCreateClient()

    const selectedClient = clients?.find((client) => client.id === selectedClientId)

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newClientName.trim()) return

        try {
            const newClient = await createClientMutation.mutateAsync({
                name: newClientName,
                phone: newClientPhone || undefined,
                email: newClientEmail || undefined
            })

            onClientSelect(newClient.id)
            setIsCreateModalOpen(false)
            setNewClientName('')
            setNewClientPhone('')
            setNewClientEmail('')
            setOpen(false)
            toast.success('Cliente creado exitosamente')
        } catch (error) {
            toast.error('Error al crear cliente')
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white"
                    >
                        {selectedClient ? (
                            <div className="flex items-center gap-2 text-left overflow-hidden">
                                <User className="h-4 w-4 shrink-0 text-blue-600" />
                                <div className="flex flex-col truncate">
                                    <span className="truncate font-medium">{selectedClient.name}</span>
                                    {selectedClient.phone && (
                                        <span className="text-xs text-muted-foreground truncate">{selectedClient.phone}</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">Seleccionar cliente...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Buscar cliente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm">
                                <p className="text-muted-foreground mb-2">No se encontraron clientes.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="gap-1"
                                >
                                    <Plus className="h-3 w-3" />
                                    Crear "{search}"
                                </Button>
                            </CommandEmpty>
                            <CommandGroup>
                                {clients?.map((client) => (
                                    <CommandItem
                                        key={client.id}
                                        value={client.id}
                                        onSelect={() => {
                                            onClientSelect(client.id === selectedClientId ? undefined : client.id)
                                            setOpen(false)
                                        }}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{client.name}</span>
                                            {client.phone && <span className="text-xs text-muted-foreground">{client.phone}</span>}
                                        </div>
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedClientId && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onClientSelect(undefined)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    title="Desvincular cliente"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateClient} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                placeholder="Nombre del cliente"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono (Opcional)</Label>
                            <Input
                                id="phone"
                                value={newClientPhone}
                                onChange={(e) => setNewClientPhone(e.target.value)}
                                placeholder="Ej: 3764..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Opcional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newClientEmail}
                                onChange={(e) => setNewClientEmail(e.target.value)}
                                placeholder="cliente@ejemplo.com"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createClientMutation.isPending}>
                                {createClientMutation.isPending ? 'Creando...' : 'Crear Cliente'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
