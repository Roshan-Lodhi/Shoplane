import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SizeGuide = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ruler className="h-4 w-4 mr-2" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Size Guide</DialogTitle>
          <DialogDescription>
            Find your perfect fit with our comprehensive size guide
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="clothing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clothing">Clothing</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>

          <TabsContent value="clothing" className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Men's Clothing</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Chest (inches)</TableHead>
                      <TableHead>Waist (inches)</TableHead>
                      <TableHead>Hip (inches)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">S</TableCell>
                      <TableCell>34-36</TableCell>
                      <TableCell>28-30</TableCell>
                      <TableCell>34-36</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">M</TableCell>
                      <TableCell>38-40</TableCell>
                      <TableCell>32-34</TableCell>
                      <TableCell>38-40</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">L</TableCell>
                      <TableCell>42-44</TableCell>
                      <TableCell>36-38</TableCell>
                      <TableCell>42-44</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">XL</TableCell>
                      <TableCell>46-48</TableCell>
                      <TableCell>40-42</TableCell>
                      <TableCell>46-48</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Women's Clothing</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Bust (inches)</TableHead>
                      <TableHead>Waist (inches)</TableHead>
                      <TableHead>Hip (inches)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">XS</TableCell>
                      <TableCell>30-32</TableCell>
                      <TableCell>24-26</TableCell>
                      <TableCell>32-34</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">S</TableCell>
                      <TableCell>32-34</TableCell>
                      <TableCell>26-28</TableCell>
                      <TableCell>34-36</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">M</TableCell>
                      <TableCell>34-36</TableCell>
                      <TableCell>28-30</TableCell>
                      <TableCell>36-38</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">L</TableCell>
                      <TableCell>36-38</TableCell>
                      <TableCell>30-32</TableCell>
                      <TableCell>38-40</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">XL</TableCell>
                      <TableCell>38-40</TableCell>
                      <TableCell>32-34</TableCell>
                      <TableCell>40-42</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to Measure</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Chest/Bust:</strong> Measure around the fullest part
                  of your chest, keeping the tape parallel to the floor
                </li>
                <li>
                  <strong>Waist:</strong> Measure around your natural waistline,
                  keeping the tape comfortably loose
                </li>
                <li>
                  <strong>Hip:</strong> Measure around the fullest part of your
                  hips, keeping the tape parallel to the floor
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Belts</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Waist (inches)</TableHead>
                      <TableHead>Belt Length (inches)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">S</TableCell>
                      <TableCell>28-30</TableCell>
                      <TableCell>34-36</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">M</TableCell>
                      <TableCell>32-34</TableCell>
                      <TableCell>38-40</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">L</TableCell>
                      <TableCell>36-38</TableCell>
                      <TableCell>42-44</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">XL</TableCell>
                      <TableCell>40-42</TableCell>
                      <TableCell>46-48</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Bags & Backpacks</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Small</span>
                  <span className="text-muted-foreground">
                    Up to 15L capacity
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Medium</span>
                  <span className="text-muted-foreground">
                    15-25L capacity
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Large</span>
                  <span className="text-muted-foreground">25L+ capacity</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Watches</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wrist Size</TableHead>
                      <TableHead>Case Diameter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        Small (6-6.5")
                      </TableCell>
                      <TableCell>36-40mm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Medium (6.5-7.5")
                      </TableCell>
                      <TableCell>40-44mm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Large (7.5"+)
                      </TableCell>
                      <TableCell>44mm+</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuide;
