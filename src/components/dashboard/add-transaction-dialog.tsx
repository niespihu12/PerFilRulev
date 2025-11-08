"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useTransition } from "react"
import { CalendarIcon, Loader2, Sparkles } from "lucide-react"
import { format } from "date-fns"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { automaticTransactionCategorization } from "@/ai/flows/automatic-transaction-categorization"
import { useToast } from "@/hooks/use-toast"
import { type Transaction } from "@/lib/types"

const transactionFormSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  type: z.enum(["income", "expense"], {
    required_error: "You need to select a transaction type.",
  }),
  category: z.enum(["Needs", "Wants", "Savings"]),
  date: z.date({
    required_error: "A date is required.",
  }),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface AddTransactionDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onTransactionAdded: (transaction: Omit<Transaction, 'id' | 'userId'>) => void
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
        title: "Missing Information",
        description: "Please enter a valid description and amount to use AI categorization.",
      })
      return
    }

    startAiTransition(async () => {
      setAiExplanation(null)
      const result = await automaticTransactionCategorization({
        transactionDescription: description,
        transactionAmount: Number(amount),
      })
      if (result) {
        form.setValue("category", result.category)
        setAiExplanation(result.explanation)
        toast({
          title: "AI Categorization Complete",
          description: `Transaction suggested as '${result.category}'.`,
        })
      }
    })
  }

  async function onSubmit(data: TransactionFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add a transaction.",
      })
      return
    }
    
    const newTransaction = {
      ...data,
      date: data.date.toISOString(),
      category: data.type === 'income' ? 'Savings' : data.category,
      userId: user.uid,
    }

    try {
      const transactionsCol = collection(firestore, "users", user.uid, "transactions")
      await addDoc(transactionsCol, newTransaction)
      
      onTransactionAdded(newTransaction)
      form.reset()
      setAiExplanation(null)
      setIsOpen(false)
      toast({
        title: "Transaction Added",
        description: `${data.description} was successfully added.`,
      })
    } catch(error) {
      console.error("Error adding transaction:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add transaction. Please try again.",
      })
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries from Walmart" {...field} />
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
                    <FormLabel>Amount</FormLabel>
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
                    <FormLabel>Date</FormLabel>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
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
                  <FormLabel>Type</FormLabel>
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
                        <FormLabel className="font-normal">Expense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Income</FormLabel>
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
                      <FormLabel>Category</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Needs">Needs (50%)</SelectItem>
                            <SelectItem value="Wants">Wants (30%)</SelectItem>
                            <SelectItem value="Savings">Savings (20%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAiCategorize}
                          disabled={isAiPending}
                          className="flex-shrink-0"
                          aria-label="Categorize with AI"
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
                    <span className="font-semibold">AI Suggestion:</span> {aiExplanation}
                  </FormDescription>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
