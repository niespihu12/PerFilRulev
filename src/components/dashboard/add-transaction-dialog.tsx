"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useTransition } from "react"
import { CalendarIcon, Loader2, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { collection, addDoc } from "firebase/firestore"
import { useFirestore, useUser } from "@/firebase"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { automaticTransactionCategorization } from "@/ai/flows/automatic-transaction-categorization"
import { useToast } from "@/hooks/use-toast"
import { type Transaction } from "@/lib/types"

const transactionFormSchema = z.object({
  description: z.string().min(2, "La descripción debe tener al menos 2 caracteres."),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
  type: z.enum(["income", "expense"], {
    required_error: "Debes seleccionar un tipo de transacción.",
  }),
  category: z.enum(["Needs", "Wants", "Savings"]),
  date: z.date({
    required_error: "La fecha es obligatoria.",
  }),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface AddTransactionDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onTransactionAdded: (transaction: Transaction) => void
}

export function AddTransactionDialog({ isOpen, setIsOpen, onTransactionAdded }: AddTransactionDialogProps) {
  const [isAiPending, startAiTransition] = useTransition()
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const { toast } = useToast()
  const firestore = useFirestore()
  const { user } = useUser()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "Wants",
    },
  })

  const transactionType = form.watch("type")

  const handleAiCategorize = () => {
    const description = form.getValues("description")
    const amount = form.getValues("amount")

    if (!description || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Información Faltante",
        description: "Por favor, introduce una descripción y un monto válidos para usar la categorización con IA.",
      })
      return
    }

    startAiTransition(async () => {
      setAiExplanation(null)
      try {
        const result = await automaticTransactionCategorization({
          transactionDescription: description,
          transactionAmount: Number(amount),
        })
        if (result) {
          form.setValue("category", result.category)
          setAiExplanation(result.explanation)
          toast({
            title: "Categorización con IA Completa",
            description: `Transacción sugerida como '${result.category}'.`,
          })
        }
      } catch (error) {
        console.error("Error en la categorización con IA:", error)
        toast({
          variant: "destructive",
          title: "Error de IA",
          description: "No se pudo categorizar la transacción. Por favor, inténtalo de nuevo.",
        })
      }
    })
  }

  async function onSubmit(data: TransactionFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error de Autenticación",
        description: "Debes iniciar sesión para agregar una transacción.",
      })
      return
    }
    
    const newTransactionData = {
      ...data,
      date: data.date.toISOString(),
      category: data.type === 'income' ? 'Savings' : data.category,
      userId: user.uid,
    }

    try {
      // The addDoc function returns a DocumentReference to the newly created document.
      const docRef = await addDoc(collection(firestore, "users", user.uid, "transactions"), newTransactionData)
      
      const finalTransaction: Transaction = {
        ...newTransactionData,
        id: docRef.id, // Use the ID from the returned DocumentReference
      }
      
      onTransactionAdded(finalTransaction)
      form.reset()
      setAiExplanation(null)
      setIsOpen(false)
      toast({
        title: "Transacción Agregada",
        description: `${data.description} se agregó correctamente.`,
      })
    } catch(error) {
      console.error("Error al agregar la transacción:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar la transacción. Por favor, inténtalo de nuevo.",
      })
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Agregar Transacción</DialogTitle>
          <DialogDescription>
            Registra un nuevo ingreso o gasto. Rellena los detalles a continuación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="ej. Comida en el supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Gasto</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Ingreso</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {transactionType === "expense" && (
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Needs">Necesidades (50%)</SelectItem>
                            <SelectItem value="Wants">Deseos (30%)</SelectItem>
                            <SelectItem value="Savings">Ahorros (20%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAiCategorize}
                          disabled={isAiPending}
                          className="flex-shrink-0"
                          aria-label="Categorizar con IA"
                        >
                          {isAiPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-accent" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {aiExplanation && (
                  <FormDescription className="mt-2 text-sm text-muted-foreground bg-secondary p-2 rounded-md">
                    <span className="font-semibold">Sugerencia de IA:</span> {aiExplanation}
                  </FormDescription>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button type="submit">Agregar Transacción</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
