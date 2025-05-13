"use client";

const RaiserInformation = ({ animals, handleAnimalChange, addAnimal }) => {
  return (
    <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="p-3 font-medium text-white bg-emerald-700">
        Raiser Information
      </div>
      <div className="p-4 bg-emerald-50 hide-scrollbar">
        {animals.map((animal, index) => (
          <div
            key={index}
            className="p-3 mb-4 border border-gray-300 rounded-md"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Animal Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={animal.animal_type}
                  onChange={(e) =>
                    handleAnimalChange(index, "animal_type", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Animal Type</option>
                  <option value="Cattle">Cattle</option>
                  <option value="Carabao">Carabao</option>
                  <option value="Goat">Goat</option>
                  <option value="Sheep">Sheep</option>
                  <option value="Swine">Swine</option>
                  <option value="Chicken">Chicken</option>
                  <option value="Duck">Duck</option>
                  <option value="Quail">Quail</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other (specify)">Other (specify)</option>
                </select>
              </div>

              {animal.animal_type === "Other (specify)" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Specify Other Animal
                  </label>
                  <input
                    type="text"
                    value={animal.other_animal_type || ""}
                    onChange={(e) =>
                      handleAnimalChange(
                        index,
                        "other_animal_type",
                        e.target.value
                      )
                    }
                    placeholder="Specify animal type"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  value={animal.subcategory}
                  onChange={(e) =>
                    handleAnimalChange(index, "subcategory", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  disabled={
                    !animal.animal_type ||
                    animal.animal_type === "Other (specify)"
                  }
                >
                  <option value="">Select Subcategory</option>
                  {animal.animal_type === "Cattle" && (
                    <>
                      <option value="Carabull">Carabull</option>
                      <option value="Caracow">Caracow</option>
                    </>
                  )}
                  {animal.animal_type === "Carabao" && (
                    <>
                      <option value="Carabull">Carabull</option>
                      <option value="Caracow">Caracow</option>
                    </>
                  )}
                  {animal.animal_type === "Goat" && (
                    <>
                      <option value="Buck">Buck</option>
                      <option value="Doe">Doe</option>
                    </>
                  )}
                  {animal.animal_type === "Sheep" && (
                    <>
                      <option value="Ram">Ram</option>
                      <option value="Ewe">Ewe</option>
                    </>
                  )}
                  {animal.animal_type === "Swine" && (
                    <>
                      <option value="Sow">Sow</option>
                      <option value="Piglet">Piglet</option>
                      <option value="Boar">Boar</option>
                      <option value="Fatteners">Fatteners</option>
                    </>
                  )}
                  {animal.animal_type === "Chicken" && (
                    <>
                      <option value="Broiler">Broiler</option>
                      <option value="Layer">Layer</option>
                      <option value="Freerange">Freerange</option>
                      <option value="Gamefowl">Gamefowl</option>
                      <option value="Fighting Cocks">Fighting Cocks</option>
                    </>
                  )}
                  {(animal.animal_type === "Duck" ||
                    animal.animal_type === "Quail" ||
                    animal.animal_type === "Turkey") && (
                    <>
                      <option value="Drake">Drake</option>
                      <option value="Hen">Hen</option>
                    </>
                  )}
                  {animal.animal_type === "Rabbit" && (
                    <>
                      <option value="Buck">Buck</option>
                      <option value="Doe">Doe</option>
                    </>
                  )}
                  {animal.animal_type === "Other (specify)" && (
                    <option value="Other">Other</option>
                  )}
                </select>
              </div>

              {animal.animal_type === "Other (specify)" &&
                animal.subcategory === "Other" && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Specify Other Subcategory
                    </label>
                    <input
                      type="text"
                      value={animal.other_subcategory || ""}
                      onChange={(e) =>
                        handleAnimalChange(
                          index,
                          "other_subcategory",
                          e.target.value
                        )
                      }
                      placeholder="Specify subcategory"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={animal.quantity}
                  onChange={(e) =>
                    handleAnimalChange(index, "quantity", e.target.value)
                  }
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addAnimal}
          className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Add Animal
        </button>
      </div>
    </div>
  );
};

export default RaiserInformation;
