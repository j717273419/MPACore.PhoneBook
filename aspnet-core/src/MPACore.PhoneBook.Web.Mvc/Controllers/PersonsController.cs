using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc;
using MPACore.PhoneBook.Controllers;
using MPACore.PhoneBook.PhoneBooks;
using MPACore.PhoneBook.PhoneBooks.Dtos;
using MPACore.PhoneBook.Web.Models.Persons;

namespace MPACore.PhoneBook.Web.Controllers
{
   

    public class PersonsController : PhoneBookControllerBase
    {
        private readonly IPersonAppService _personAppService;

        public PersonsController(IPersonAppService personAppService)
        {
            _personAppService = personAppService;
        }

        public async Task<IActionResult> Index()
        {
            
 // var dtos=   await    _personAppService.GetPagedPersonAsync(input);

            var viewModel=new PersonsViewModel()
            {
                FilterText = Request.Query["filterText"],
            };



            return View(viewModel);
        }


        public async Task<PartialViewResult> CreateOrEditModal(int? id)
        {

            var output = await _personAppService.GetPersonForEditAsync(new NullableIdDto(id));

            var viewModel=new CreateOrEditPersonModalViewModel(output);


            return PartialView("_CreateOrEditModal",viewModel);



        }
        



    }
}