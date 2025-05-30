<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <Label htmlFor="name" className="block mb-1 font-medium">
      Name
    </Label>
    <Input
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter product name"
    />
  </div>

  <div>
    <Label htmlFor="description" className="block mb-1 font-medium">
      Description
    </Label>
    <Textarea
      id="description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Enter product description"
    />
  </div>

  <div>
    <Label htmlFor="price" className="block mb-1 font-medium">
      Price
    </Label>
    <Input
      id="price"
      type="number"
      value={price}
      onChange={(e) => setPrice(Number(e.target.value))}
      placeholder="Enter product price"
    />
  </div>

  <div>
    <Label htmlFor="quantity" className="block mb-1 font-medium">
      Quantity
    </Label>
    <Input
      id="quantity"
      type="number"
      value={quantity}
      onChange={(e) => setQuantity(Number(e.target.value))}
      placeholder="Enter stock quantity"
    />
  </div>

  <div>
    <Label htmlFor="category" className="block mb-1 font-medium">
      Category
    </Label>
    <Input
      id="category"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      placeholder="Enter category"
    />
  </div>

  <div>
    <Label htmlFor="image" className="block mb-1 font-medium">
      Product Image
    </Label>
    <Input
      id="image"
      type="file"
      accept="image/*"
      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
    />
    {imageUrl && (
      <img
        src={imageUrl}
        alt="Current Product"
        className="mt-2 h-24 rounded border"
      />
    )}
  </div>

  <Button type="submit" disabled={loading} className="w-full">
    {loading ? "Updating..." : "Update Product"}
  </Button>
</form>
