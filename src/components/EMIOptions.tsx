import { useState } from "react";
import { CreditCard, Calendar, Percent, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EMIOptionsProps {
  totalAmount: number;
}

interface EMIPlan {
  months: number;
  interestRate: number;
  emi: number;
  totalAmount: number;
  provider: string;
}

interface BNPLOption {
  name: string;
  description: string;
  maxAmount: number;
  terms: string;
  logo?: string;
}

const EMIOptions = ({ totalAmount }: EMIOptionsProps) => {
  const [selectedEMI, setSelectedEMI] = useState<string | null>(null);
  const [isEMIOpen, setIsEMIOpen] = useState(false);
  const [isBNPLOpen, setIsBNPLOpen] = useState(false);

  // Calculate EMI options
  const calculateEMI = (principal: number, rate: number, months: number): number => {
    if (rate === 0) return principal / months;
    const monthlyRate = rate / 12 / 100;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const emiPlans: EMIPlan[] = [
    {
      months: 3,
      interestRate: 0,
      emi: calculateEMI(totalAmount, 0, 3),
      totalAmount: totalAmount,
      provider: "No Cost EMI",
    },
    {
      months: 6,
      interestRate: 12,
      emi: calculateEMI(totalAmount, 12, 6),
      totalAmount: calculateEMI(totalAmount, 12, 6) * 6,
      provider: "Standard EMI",
    },
    {
      months: 9,
      interestRate: 14,
      emi: calculateEMI(totalAmount, 14, 9),
      totalAmount: calculateEMI(totalAmount, 14, 9) * 9,
      provider: "Standard EMI",
    },
    {
      months: 12,
      interestRate: 15,
      emi: calculateEMI(totalAmount, 15, 12),
      totalAmount: calculateEMI(totalAmount, 15, 12) * 12,
      provider: "Standard EMI",
    },
  ];

  const bnplOptions: BNPLOption[] = [
    {
      name: "Simpl",
      description: "Pay in 3 interest-free parts",
      maxAmount: 50000,
      terms: "Split into 3 payments over 6 weeks",
    },
    {
      name: "LazyPay",
      description: "Pay later in 15 days",
      maxAmount: 100000,
      terms: "Pay within 15 days, no interest",
    },
    {
      name: "ZestMoney",
      description: "Easy monthly installments",
      maxAmount: 200000,
      terms: "Flexible EMI options available",
    },
    {
      name: "PayLater by ICICI",
      description: "45 days interest-free credit",
      maxAmount: 500000,
      terms: "No interest if paid within 45 days",
    },
  ];

  const eligibleBNPL = bnplOptions.filter(opt => totalAmount <= opt.maxAmount);

  return (
    <div className="space-y-3">
      {/* EMI Options */}
      <Collapsible open={isEMIOpen} onOpenChange={setIsEMIOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-auto py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">EMI Options</div>
                <div className="text-xs text-muted-foreground">
                  Starting ₹{Math.round(emiPlans[0].emi).toLocaleString()}/month
                </div>
              </div>
            </div>
            {isEMIOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 p-4">
            <RadioGroup value={selectedEMI || ""} onValueChange={setSelectedEMI}>
              <div className="space-y-3">
                {emiPlans.map((plan, index) => (
                  <label 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEMI === `emi-${index}` 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/30'
                    }`}
                  >
                    <RadioGroupItem value={`emi-${index}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.months} Months</span>
                        {plan.interestRate === 0 && (
                          <Badge className="bg-green-500 text-white text-xs">
                            No Cost EMI
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.interestRate > 0 && `${plan.interestRate}% p.a. • `}
                        Total: ₹{Math.round(plan.totalAmount).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        ₹{Math.round(plan.emi).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">/month</div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Info className="h-3 w-3" />
              EMI available on credit cards from select banks
            </p>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* BNPL Options */}
      <Collapsible open={isBNPLOpen} onOpenChange={setIsBNPLOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-auto py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-violet-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">Buy Now, Pay Later</div>
                <div className="text-xs text-muted-foreground">
                  {eligibleBNPL.length} options available
                </div>
              </div>
            </div>
            {isBNPLOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 p-4">
            <div className="space-y-3">
              {eligibleBNPL.map((option, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="font-bold text-sm text-violet-600">
                      {option.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{option.terms}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Eligible
                  </Badge>
                </div>
              ))}

              {eligibleBNPL.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No BNPL options available for this amount</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Subject to eligibility and provider terms
            </p>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EMIOptions;
